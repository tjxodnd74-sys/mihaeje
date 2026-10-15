import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let esbuild;try{esbuild=require(process.env.PERF_ESBUILD||'esbuild')}catch{esbuild=require('../../perf-tools/node_modules/esbuild')}
const web=path.resolve('web'),out=path.join(web,'game-bundles');fs.mkdirSync(out,{recursive:true});
const canonical=value=>value.replace(/(index|case|episode|studio|ohang)\.html/g,(_,name)=>name==='index'?'./':name).replaceAll("id+'.html'",'id');
const digest=value=>createHash('sha256').update(value).digest('hex').slice(0,12),fontHash=digest(fs.readFileSync(path.join(web,'assets/SUIT-Game-v53.woff2')));
const collections=JSON.parse(fs.readFileSync(path.join(web,'collections.json'),'utf8')),catalogue=JSON.parse(fs.readFileSync(path.join(web,'cases.json'),'utf8'));
const episodes=Object.fromEntries(['apartment','radio','station','laundry','letter','pet-home','cat-invite'].map(id=>[id,JSON.parse(fs.readFileSync(path.join(web,'episodes',id+'.json'),'utf8'))]));
const revisions=Object.fromEntries(Object.keys(episodes).map(id=>[id,digest(fs.readFileSync(path.join(web,'episodes',id+'.json')))])),entry='window.MihaejeEpisodeVersions='+JSON.stringify(revisions)+';\n'+fs.readFileSync(path.join(web,'performance-entry.js'),'utf8')+'\n'+fs.readFileSync(path.join(web,'perf-probe.js'),'utf8'),seedHash=digest(entry);
fs.writeFileSync(path.join(out,'performance-entry-v58.js'),entry);
const summary={};
for(const page of ['index','case','episode','studio','ohang']){
 const template=path.join(web,page+'.html'),original=fs.readFileSync(template,'utf8');
 // Source tags remain in the editable HTML; generated deployment HTML is separate.
 const tags=[...original.matchAll(/<script([^>]*?)src="([^"]+)"([^>]*)><\/script>/g)];
 const scripts=tags.filter(m=>!m[2].startsWith('theme-ui')).map(m=>({file:m[2].split('?')[0],module:/type="module"/.test(m[1]+m[3])}));
 const classic=scripts.filter(m=>!m.module&&!['app.js','hub.js'].includes(m.file)),modules=scripts.filter(m=>m.module||['app.js','hub.js'].includes(m.file));
 const boot=page==='episode'?{collections}:page==='index'?{catalogue,collections}:{};
 const media=page==='index'?[]:[fs.readFileSync(path.join(web,'responsive-assets-v53.js'),'utf8'),fs.readFileSync(path.join(web,'responsive-media.js'),'utf8')];
 const code=canonical(['window.MihaejeBoot='+JSON.stringify(boot)+';',...media,...classic.map(m=>'\n;/* '+m.file+' */\n'+fs.readFileSync(path.join(web,m.file),'utf8')),fs.readFileSync(path.join(web,'theme-ui.js'),'utf8'),...modules.map(m=>'\nsetTimeout(()=>import("./'+m.file+'"),0);')].join('\n;\n'));
 await esbuild.build({stdin:{contents:code,resolveDir:web,sourcefile:page+'-entry.js'},outfile:path.join(out,page+'-v53.js'),bundle:true,format:'iife',minify:true,charset:'utf8',target:['safari15','chrome100'],legalComments:'eof',logLevel:'warning'});
 // Imported module navigation is compiled after the entry source; canonicalize it too.
 const jsFile=path.join(out,page+'-v53.js');fs.writeFileSync(jsFile,canonical(fs.readFileSync(jsFile,'utf8')));
 const cssTags=[...original.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
 const css=cssTags.map(m=>fs.readFileSync(path.join(web,m[1].split('?')[0]),'utf8')).join('\n')+'\n'+fs.readFileSync(path.join(web,'performance-v53.css'),'utf8');
 const styled=css.replaceAll('assets/SUIT-Variable.woff2','../assets/SUIT-Game-v53.woff2?v='+fontHash).replace(/url\((['"]?)(assets\/)/g,'url($1../$2');
 const compiled=await esbuild.transform(styled+'\n'+fs.readFileSync(path.join(web,'font-fallback-v53.css'),'utf8'),{loader:'css',minify:true,charset:'utf8',target:['safari15','chrome100'],legalComments:'eof'});fs.writeFileSync(path.join(out,page+'-v53.css'),compiled.code);
 let html=canonical(original).replace(/<script([^>]*?)src="([^"]+)"([^>]*)><\/script>/g,'').replace(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,'');
 const jsHash=digest(fs.readFileSync(path.join(out,page+'-v53.js'))),cssHash=digest(compiled.code);
 // First visitors need these styles before anything can paint. Inline the same
 // compiled CSS to avoid a second cold hosting request on the critical path.
 // Relative assets keep resolving at the site root; the CSS file remains as a
 // compatible build artifact for older cached documents.
 html=html.replace('</head>','<script>'+entry.replaceAll('</script','<\\/script')+'</script><style>'+compiled.code.replaceAll('</style','<\\/style')+'</style><script defer src="game-bundles/'+page+'-v53.js?v='+jsHash+'"></script></head>');
 fs.writeFileSync(path.join(out,page+'.html'),html);
 summary[page]={classicScripts:classic.length,moduleEntries:modules.length,jsBytes:fs.statSync(path.join(out,page+'-v53.js')).size,cssBytes:compiled.code.length};
}
fs.writeFileSync('design/performance-bundles-v53.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
