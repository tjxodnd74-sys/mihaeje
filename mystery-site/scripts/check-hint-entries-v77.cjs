const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
for(const [file,app] of [['case','app'],['episode','episode'],['studio','studio'],['ohang','ohang']]){
 const html=fs.readFileSync(path.join(root,'web',file+'.html'),'utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>/g)].map(m=>m[1].split('?')[0]);
 for(const required of ['copy-editor-v74.js','answer-actions-v77.js'])assert.equal(scripts.filter(s=>s===required).length,1,file+': '+required+' exactly once');
 assert(scripts.indexOf('copy-editor-v74.js')<scripts.indexOf('answer-actions-v77.js'),file+': apply revised answers after copy');
 assert(scripts.indexOf('answer-actions-v77.js')<scripts.indexOf(app+'.js'),file+': apply answers before game boots');
 assert(html.includes('hints-identity-v77.css'),file+': themed hint stylesheet');
}
console.log('PASS: all 4 production entry pages load copy, exact answers, and themed hints before game boot.');
