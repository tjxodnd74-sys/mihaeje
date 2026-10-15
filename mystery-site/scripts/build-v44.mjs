import fs from 'node:fs';
await import('./build-performance-v53.mjs');
const media={};for(const f of fs.readdirSync('web/assets',{recursive:true}).filter(f=>/\.(mp3|mp4|wav)$/i.test(f))){media['/assets/'+f.replaceAll('\\','/')]=fs.statSync('web/assets/'+f).size;}
const worker=fs.readFileSync('worker/index.js','utf8').replace(/\/\* MEDIA_SIZES \*\/const mediaSizes=\{[^;]*\};/,'/* MEDIA_SIZES */const mediaSizes='+JSON.stringify(media)+';');fs.writeFileSync('worker/index.js',worker);
fs.mkdirSync('dist/client',{recursive:true});fs.cpSync('web','dist/client',{recursive:true});
for(const page of ['index','case','episode','studio','ohang']){const compiled='web/game-bundles/'+page+'.html';if(fs.existsSync(compiled))fs.copyFileSync(compiled,'dist/client/'+page+'.html');}
fs.mkdirSync('dist/server',{recursive:true});fs.copyFileSync('worker/index.js','dist/server/index.js');
fs.mkdirSync('dist/.openai',{recursive:true});fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Built existing game assets, authenticated feedback Worker and D1 migrations.');
