import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('web');http.createServer((q,r)=>{
 let p=path.resolve(root,'.'+decodeURIComponent(new URL(q.url,'http://localhost').pathname));
 if(!p.startsWith(root+path.sep)&&p!==root){r.writeHead(403).end();return}
 if(p===root||fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');
 fs.readFile(p,(e,b)=>{
  if(e){r.writeHead(404).end();return}
  r.setHeader('Cache-Control','no-store');r.setHeader('Accept-Ranges','bytes');
  r.setHeader('Content-Type',({'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json','.webm':'video/webm','.mp4':'video/mp4','.woff2':'font/woff2'})[path.extname(p)]||'application/octet-stream');
  const range=/^bytes=(\d*)-(\d*)$/.exec(q.headers.range||'');
  if(range){const start=range[1]?Number(range[1]):Math.max(0,b.length-Number(range[2])),end=range[1]&&range[2]?Math.min(Number(range[2]),b.length-1):b.length-1;if(start>=b.length||end<start){r.writeHead(416,{'Content-Range':'bytes */'+b.length}).end();return}r.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${b.length}`,'Content-Length':end-start+1});r.end(q.method==='HEAD'?undefined:b.subarray(start,end+1));return}
  r.setHeader('Content-Length',b.length);r.end(q.method==='HEAD'?undefined:b);
 })
}).listen(Number(process.argv[2]||8768),'127.0.0.1',()=>console.log('Escape QA http://127.0.0.1:'+(process.argv[2]||8768)));
