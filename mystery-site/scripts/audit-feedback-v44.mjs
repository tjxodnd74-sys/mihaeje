import assert from 'node:assert/strict';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';import worker from '../worker/index.js';
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('drizzle/0000_beta_feedback.sql','utf8'));
let calls=0;const env={FEEDBACK_OWNER_EMAIL:'owner@example.test',ASSETS:{fetch:()=>new Response('preserved asset')},DB:{prepare(sql){calls++;let args=[];return{bind(...values){args=values;return this},async first(){return db.prepare(sql).get(...args)},async all(){return {results:db.prepare(sql).all(...args)}},async run(){return db.prepare(sql).run(...args)}}}}};
const origin='https://beta.example.test',req=(path,method='GET',data,who='',extra={})=>new Request(origin+path,{method,headers:{'Content-Type':'application/json',Origin:origin,...(who?{'oai-authenticated-user-email':who}:{}),...extra},...(data!==undefined?{body:JSON.stringify(data)}:{})});
const sample={game:'laundry',device:'phone',topic:'readability',notes:'<img src=x onerror=alert(1)> 글씨 확인',flow:'4',clue:'3',replay:'yes',scene:'기계열 작업대'};
assert.equal((await worker.fetch(req('/'),env)).status,200);
for(const [who,allowed]of [['',false],['viewer@example.test',false],['owner@example.test',true]]){
 const probe=await worker.fetch(req('/api/feedback-access','GET',undefined,who),env);
 assert.deepEqual(await probe.json(),{owner:allowed});assert.match(probe.headers.get('cache-control'),/no-store/);
}
assert.deepEqual(await (await worker.fetch(req('/api/feedback-access?email=owner@example.test'),env)).json(),{owner:false});
for(const who of ['', 'viewer@example.test']){assert.equal((await worker.fetch(req('/api/admin/feedback','GET',undefined,who),env)).status,403);assert.equal((await worker.fetch(req('/api/admin/feedback','PATCH',{id:crypto.randomUUID(),reviewed:true},who),env)).status,403);}
assert.equal((await worker.fetch(req('/feedback-admin'),env)).status,302);
assert.equal((await worker.fetch(req('/feedback-admin','GET',undefined,'viewer@example.test'),env)).status,403);
assert.equal((await worker.fetch(req('/feedback-admin','GET',undefined,'owner@example.test'),env)).status,200);
assert.equal((await worker.fetch(req('/api/feedback','POST',{...sample,email:'owner@example.test'},'',{Origin:'https://other.test'}),env)).status,403);
assert.equal((await worker.fetch(req('/api/feedback','POST',{...sample,flow:8}),env)).status,400);
assert.equal((await worker.fetch(req('/api/feedback','POST',{...sample,notes:'x'.repeat(2100)}),env)).status,400);
const sent=await worker.fetch(req('/api/feedback','POST',sample),env);assert.equal(sent.status,201);const {id}=await sent.json(),cookie=sent.headers.get('set-cookie').split(';')[0];assert(cookie.includes('mih_beta='));
assert.equal((await worker.fetch(req('/api/admin/feedback?email=owner@example.test'),env)).status,403);
const list=await worker.fetch(req('/api/admin/feedback','GET',undefined,'OWNER@example.test'),env),data=await list.json();assert.equal(data.rows.length,1);assert.equal(data.rows[0].id,id);assert.equal(data.rows[0].note,sample.notes);assert(!('client_key'in data.rows[0]));assert.match(list.headers.get('cache-control'),/no-store/);
assert.equal((await worker.fetch(req('/api/admin/feedback','PATCH',{id,reviewed:true},'owner@example.test'),env)).status,200);assert.equal(db.prepare('SELECT reviewed FROM beta_feedback WHERE id=?').get(id).reviewed,1);
for(let i=0;i<7;i++)assert.equal((await worker.fetch(req('/api/feedback','POST',sample,'',{Cookie:cookie}),env)).status,201);
assert.equal((await worker.fetch(req('/api/feedback','POST',sample,'',{Cookie:cookie}),env)).status,429);
assert.equal((await worker.fetch(req('/api/unknown'),env)).status,404);assert.equal((await worker.fetch(req('/server/index.js'),env)).status,404);
assert(!fs.readFileSync('web/feedback-admin.js','utf8').includes('innerHTML'));
console.log('PASS persistent submission, owner-only read and review, anonymous/viewer denial, identity spoof denial, origin checks, validation, rate limit, parameter binding, safe text rendering and private cache.');
