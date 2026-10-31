  const secs=[...document.querySelectorAll("section.ch")];
  const LS=__STORAGE_PREFIX__;
  const get=(k,d)=>{try{const v=localStorage.getItem(LS+k);return v===null?d:JSON.parse(v)}catch(e){return d}};
  const set=(k,v)=>{try{localStorage.setItem(LS+k,JSON.stringify(v))}catch(e){}};
  let done=get("done",{});
  let cur=0;
  const $=id=>document.getElementById(id);
  const hid=s=>s.dataset.app?s.dataset.ch:"c"+s.dataset.ch;

