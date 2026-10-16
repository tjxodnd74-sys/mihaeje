/* Use the crop's full displayed width; hotspot coordinates retain their original frame. */
(()=>{
 function apply(img,src,crop=100,width=0){const v=window.MihaejeImageVariants?.[src];if(!v){const changed=img.hasAttribute('srcset');img.removeAttribute('srcset');img.removeAttribute('sizes');delete img.dataset.responsiveSource;return changed}const sizes=Math.ceil((width||innerWidth)*100/crop)+'px',set=v.variants.map(([path,w])=>path+' '+w+'w').concat(src+' '+v.width+'w').join(', '),changed=img.dataset.responsiveSource!==set||img.sizes!==sizes;img.sizes=sizes;if(img.dataset.responsiveSource!==set){img.srcset=set;img.dataset.responsiveSource=set;}img.decoding='async';return changed;}
 window.MihaejeResponsive={apply};
})();
