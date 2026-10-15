const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const configPath=path.join(root,'design','style-entries.json');
const pages=['index.html','case.html','episode.html','studio.html','ohang.html'];
let config;
if(fs.existsSync(configPath))config=JSON.parse(fs.readFileSync(configPath,'utf8'));
else{config={};for(const page of pages){const html=fs.readFileSync(path.join(root,'dist',page),'utf8');config[page]=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"[^>]*>/g)].map(m=>m[1]).concat('reading.css')}fs.writeFileSync(configPath,JSON.stringify(config,null,2)+'\n')}
for(const page of pages){
 const bundle='site-'+page.replace('.html','')+'-v40.css';
 const css=config[page].map(file=>'/* '+file+' */\n'+fs.readFileSync(path.join(root,'dist',file),'utf8')).join('\n');
 fs.writeFileSync(path.join(root,'dist',bundle),css);
 const file=path.join(root,'dist',page);let used=false;
 const html=fs.readFileSync(file,'utf8').replace(/<link rel="stylesheet" href="[^"]+"[^>]*>/g,()=>{if(used)return '';used=true;return '<link rel="stylesheet" href="'+bundle+'">'});
 if(!used)throw Error('No stylesheet found: '+page);
 fs.writeFileSync(file,html);
 console.log(page+': '+config[page].length+' styles → 1 stylesheet');
}
