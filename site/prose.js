window.MihaejeProse=root=>{
  root.querySelectorAll('p:not(.eyebrow):not(.tag):not(.small),blockquote').forEach(p=>{
    const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),nodes=[];let node;
    while(node=walker.nextNode())nodes.push(node);
    nodes.forEach(n=>{const parts=n.textContent.split(/(?<=습니다|입니다|세요|였다|했다|있었다|없었다)\s+(?=[가-힣0-9“])/u),inlineNext=n.nextSibling&&n.nextSibling.nodeName!=='BR'&&/(습니다|입니다|세요)\s+$/.test(n.textContent);if(parts.length<2&&!inlineNext)return;const f=document.createDocumentFragment();parts.forEach((part,i)=>{if(i)f.append(document.createElement('br'));f.append(document.createTextNode(part))});if(inlineNext)f.append(document.createElement('br'));n.replaceWith(f)});
  });
};
document.addEventListener('DOMContentLoaded',()=>{const main=document.querySelector('main');if(main)window.MihaejeProse(main)});
