  /* ---------- 章送り ---------- */
  secs.forEach((s,i)=>{
    const pg=document.createElement("div");pg.className="pager";
    const prev=i>0?`<button type="button" data-go="${i-1}">← ${secs[i-1].dataset.short}</button>`:"<span></span>";
    const next=i<secs.length-1?`<button type="button" data-go="${i+1}">${secs[i+1].dataset.short} →</button>`:"<span></span>";
    pg.innerHTML=`${prev}${s.dataset.app?"":`<button type="button" class="done-btn" data-done="${s.dataset.ch}"></button>`}${next}`;
    s.appendChild(pg);
  });

