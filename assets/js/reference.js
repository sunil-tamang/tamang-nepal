(() => {
 const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
 const cards=$$('[data-ref-card]'), filters=$$('[data-ref-filter]'); let category='All'; const query=(new URLSearchParams(location.search).get('q')||'').trim().toLowerCase();
 function filter(){if(!$('#ref-catalogue'))return; const material=$('#ref-material-filter').value; let count=0; cards.forEach(c=>{c.hidden=!(category==='All'||c.dataset.category===category)||!(material==='All'||c.dataset.refMaterial===material)||!c.dataset.name.toLowerCase().includes(query);if(!c.hidden)count++;});$('#ref-empty').hidden=count>0; const sort=$('#ref-sort').value; cards.sort((a,b)=>sort==='name'?a.dataset.name.localeCompare(b.dataset.name):Number(a.dataset.number)-Number(b.dataset.number)).forEach(c=>$('#ref-catalogue').append(c));}
 filters.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.refFilter;filters.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter();}));
 filter();
 $('#ref-material-filter')?.addEventListener('change',filter);$('#ref-sort')?.addEventListener('change',filter);
 $$('[data-ref-image]').forEach(b=>b.addEventListener('click',()=>{$('#ref-gallery-image').src=b.dataset.refImage;$$('[data-ref-image]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
 const searchDialog=$('#header-search'),searchToggle=$('.header-search-toggle');
 searchToggle?.addEventListener('click',()=>{searchDialog.showModal();$('#header-search-input').focus();});
 $('#header-search-close')?.addEventListener('click',()=>searchDialog.close());
 searchDialog?.addEventListener('close',()=>searchToggle.focus());
 const panel=$('#ref-material-copy'),photo=$('#ref-material-photo'),tabs=$$('[data-ref-tab]'); if(panel&&photo){const original=panel.innerHTML,base=photo.src.replace(/[^/]+$/,'');const photos={tent:'tent-fabric.jpg',parachute:'parachute-home.jpg',offcuts:'seams.jpg',dyed:'dyed-cloth.jpg'};function select(id,update=true){if(!photos[id])id='tent';panel.innerHTML=id==='tent'?original:$('#ref-panel-'+id).innerHTML;photo.src=base+photos[id];photo.alt='Illustrative '+tabs.find(t=>t.dataset.refTab===id).textContent.trim();tabs.forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.refTab===id)));if(update){const u=new URL(location.href);u.searchParams.set('material',id);history.replaceState(null,'',u);}}tabs.forEach(t=>t.addEventListener('click',()=>select(t.dataset.refTab)));const query=new URLSearchParams(location.search).get('material');select(({textiles:'offcuts','rice-sacks':'offcuts',plastic:'tent'})[query]||query||'tent',false);}
})();
