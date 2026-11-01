(() => {
  const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
  const matchesText = (text, query) => normalize(query).split(' ').filter(Boolean).every(term => normalize(text).includes(term));
  const matchProducts = (products, query) => products.filter(product => matchesText([product.title, product.description, ...(product.tags || [])].join(' '), query)).sort((a,b) => {
    const q=normalize(query),rank=p=>normalize(p.title)===q?0:normalize(p.title).startsWith(q)?1:2;
    return q ? rank(a)-rank(b) : 0;
  });
  const getSuggestions = (products, query) => {
    const q=normalize(query), titles=matchProducts(products,q).map(p=>normalize(p.title));
    return [...new Set(q ? [q,...titles] : titles)].slice(0,4);
  };
  if(typeof module !== 'undefined' && module.exports) module.exports={normalize,matchesText,matchProducts,getSuggestions};
  if(typeof document === 'undefined') return;
  window.TamangSearch={matchesText};
  const dialog=document.querySelector('#header-search'),toggle=document.querySelector('.header-search-toggle'),data=document.querySelector('#search-catalogue-data');
  if(!dialog||!toggle||!data) return;
  let products;
  try {products=JSON.parse(data.textContent);} catch {return;}
  const input=dialog.querySelector('#header-search-input'),suggestions=dialog.querySelector('#search-suggestions'),grid=dialog.querySelector('#search-product-grid'),clear=dialog.querySelector('#search-clear'),all=dialog.querySelector('#search-all-results'),empty=dialog.querySelector('#search-empty'),status=dialog.querySelector('#search-result-status'),title=dialog.querySelector('#search-results-title');
  let options=[],active=-1,closing=false,closeTimer;
  const icon=()=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const circle=document.createElementNS(svg.namespaceURI,'circle');circle.setAttribute('cx','10.5');circle.setAttribute('cy','10.5');circle.setAttribute('r','6.5');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','m16 16 5 5');svg.append(circle,path);return svg;};
  const setActive=index=>{active=index;[...suggestions.children].forEach((option,i)=>option.setAttribute('aria-selected',String(i===active)));if(active>=0) input.setAttribute('aria-activedescendant',suggestions.children[active].id);else input.removeAttribute('aria-activedescendant');};
  const render=()=>{
    const query=input.value.trim(),matches=matchProducts(products,query);
    options=getSuggestions(products,query);suggestions.replaceChildren();
    options.forEach((value,i)=>{const option=document.createElement('li');option.id=`search-suggestion-${i}`;option.setAttribute('role','option');option.setAttribute('aria-selected','false');option.dataset.query=value;const label=document.createElement('span');label.textContent=value;option.append(icon(),label);suggestions.append(option);});
    setActive(-1);input.setAttribute('aria-expanded',String(options.length>0));clear.hidden=!query;
    grid.replaceChildren();matches.slice(0,3).forEach(product=>{const link=document.createElement('a');link.className='search-product';link.href=product.url;const image=document.createElement('img');image.src=product.image;image.alt=product.alt||product.title;image.width=320;image.height=320;const heading=document.createElement('h3');heading.textContent=product.title;const description=document.createElement('p');description.textContent=product.description;link.append(image,heading,description);grid.append(link);});
    title.textContent=`Matching products (${matches.length})`;status.textContent=`${matches.length} matching ${matches.length===1?'product':'products'}.`;empty.hidden=matches.length>0;
    const url=new URL(dialog.dataset.collectionUrl,location.href);if(query&&matches.length)url.searchParams.set('q',query);all.href=url.pathname+url.search;all.textContent=matches.length?`View all results (${matches.length})`:'Browse all products';
  };
  const finish=()=>{clearTimeout(closeTimer);closing=false;dialog.classList.remove('is-closing');document.body.classList.remove('search-modal-open');toggle.setAttribute('aria-expanded','false');input.setAttribute('aria-expanded','false');toggle.focus();};
  const close=()=>{if(!dialog.open||closing)return;closing=true;const complete=()=>dialog.close();if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)complete();else{dialog.classList.add('is-closing');closeTimer=setTimeout(complete,180);}};
  toggle.addEventListener('click',()=>{if(dialog.open){close();return;}const header=document.querySelector('.site-header').getBoundingClientRect();dialog.style.setProperty('--search-top',`${Math.max(16,Math.min(header.bottom+8,window.innerHeight-260))}px`);render();dialog.showModal();document.body.classList.add('search-modal-open');toggle.setAttribute('aria-expanded','true');input.focus();});
  dialog.querySelector('#header-search-close').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',finish);
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();});
  input.addEventListener('input',event=>{if(!event.isComposing)render();});input.addEventListener('compositionend',render);
  clear.addEventListener('click',()=>{input.value='';render();input.focus();});
  suggestions.addEventListener('click',event=>{const option=event.target.closest('[data-query]');if(option){input.value=option.dataset.query;render();input.focus();}});
  input.addEventListener('keydown',event=>{if((event.key==='ArrowDown'||event.key==='ArrowUp')&&options.length){event.preventDefault();setActive(event.key==='ArrowDown'?(active+1)%options.length:(active<=0?options.length-1:active-1));}else if(event.key==='Enter'&&active>=0){event.preventDefault();input.value=options[active];render();input.focus();}});
})();
