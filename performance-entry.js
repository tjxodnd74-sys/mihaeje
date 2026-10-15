/* Set the surface before the first paint; covers are discovered before game JavaScript. */
(()=>{
 const q=new URLSearchParams(location.search),part=location.pathname.split('/').pop(),id=q.get('case')||(part.startsWith('studio')?'studio':part.startsWith('ohang')?'ohang':part.startsWith('case')?'garage':'hub');
 document.documentElement.dataset.theme=id;
 if(q.has('case')&&['apartment','radio','station','laundry','letter','pet-home','cat-invite'].includes(id)){
  const marker=q.get('cold')==='1'&&q.get('perf')?'?perf_cache='+encodeURIComponent(q.get('perf')):'';
  const link=document.createElement('link');link.rel='preload';link.as='image';link.imageSrcset='assets/covers/'+id+'-480-v2.webp'+marker+' 480w, assets/covers/'+id+'-960-v2.webp'+marker+' 960w, assets/covers/'+id+'-v1.webp'+marker+' 1536w';link.imageSizes='(max-width:700px) 100vw, 55vw';link.fetchPriority='high';document.head.append(link);
  const revision=window.MihaejeEpisodeVersions?.[id]||'58';
  window.MihaejeEpisodePromise=fetch('episodes/'+id+'.json?v='+revision+marker.replace('?','&')).then(r=>r.ok?r.json():null).catch(()=>null);
 }
})();
