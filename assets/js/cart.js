/* One local enquiry cart. No payments or orders are submitted here. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TamangCart=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const KEY='tamang-cart-v1';
  const quantity=value=>Math.max(1,Math.min(99,Number.parseInt(value,10)||1));
  function normalize(items,products){const valid=new Set(products.map(p=>p.slug)),merged=new Map();if(!Array.isArray(items))return [];for(const item of items){if(!item||typeof item.slug!=='string'||!valid.has(item.slug))continue;merged.set(item.slug,quantity((merged.get(item.slug)||0)+quantity(item.quantity)));}return [...merged].map(([slug,quantity])=>({slug,quantity}));}
  function createCart(products,{storage,eventTarget}={}){
    const listeners=new Set();let items=[];
    const read=()=>{try{const raw=storage?.getItem(KEY);if(raw===null||raw===undefined)return null;const value=JSON.parse(raw);return normalize(value?.version===1?value.items:[],products);}catch{return null;}};
    const write=()=>{try{storage?.setItem(KEY,JSON.stringify({version:1,items}));}catch{}};
    const stored=read();
    if(stored!==null)items=stored;
    else{try{const legacy=JSON.parse(storage?.getItem('tamang-saved-v2')||'[]'),counts=JSON.parse(storage?.getItem('tamang-saved-quantities-v1')||'{}');items=normalize(Array.isArray(legacy)?[...new Set(legacy)].map(slug=>({slug,quantity:counts?.[slug]})):[],products);}catch{}write();}
    const snapshot=()=>items.map(item=>({...item}));
    const emit=()=>listeners.forEach(fn=>fn(snapshot()));
    const refresh=()=>{const latest=read();if(latest!==null)items=latest;};
    const commit=value=>{items=normalize(value,products);write();emit();return snapshot();};
    const onStorage=event=>{if(event.key!==KEY&&event.key!==null)return;const next=read();items=next||[];emit();};
    eventTarget?.addEventListener('storage',onStorage);
    return {
      getItems:snapshot,
      total:()=>items.reduce((sum,item)=>sum+item.quantity,0),
      add:(slug,count=1)=>{refresh();return commit([...items,{slug,quantity:quantity(count)}]);},
      setQuantity:(slug,count)=>{refresh();return commit(items.map(item=>item.slug===slug?{slug,quantity:quantity(count)}:item));},
      remove:slug=>{refresh();return commit(items.filter(item=>item.slug!==slug));},
      clear:()=>commit([]),
      subscribe:fn=>{listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn);},
      destroy:()=>{listeners.clear();eventTarget?.removeEventListener('storage',onStorage);}
    };
  }
  function buildEnquiry(products,items,{name='',email='',message=''}={}){
    const bySlug=new Map(products.map(p=>[p.slug,p]));
    const lines=['TAMANG Nepal — enquiry','',`Name: ${name.trim()}`,`Email: ${email.trim()}`,'','Selected products:'];
    normalize(items,products).forEach(item=>lines.push(`• ${bySlug.get(item.slug).title} — quantity ${item.quantity}`));
    if(message.trim())lines.push('',message.trim());
    lines.push('','Please confirm available colours, dimensions, materials and delivery.');
    return lines.join('\n');
  }
  return {KEY,quantity,normalize,createCart,buildEnquiry};
});
