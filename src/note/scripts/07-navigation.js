  /* ---------- 章タブ・目次 ---------- */
  const chtabs=$("chtabs"),tree=$("tree");
  function buildTabs(){
    chtabs.innerHTML="";
    secs.forEach((s,i)=>{
      const b=document.createElement("button");b.type="button";b.className="chtab";b.dataset.go=i;
      const n=s.dataset.ch;
      b.title=s.dataset.title;
      b.innerHTML=`<span class="num">${s.dataset.icon||n}</span><span class="t">${s.dataset.tab}</span>${done[n]?'<span class="chk">✓</span>':""}`;
      if(i===cur)b.setAttribute("aria-current","true");
      chtabs.appendChild(b);
    });
    const real=secs.filter(s=>!s.dataset.app);
    $("prog").innerHTML=`読了 <b>${real.filter(s=>done[s.dataset.ch]).length}</b> / ${real.length}`;
    secs.forEach(s=>{const db=s.querySelector(".done-btn");if(!db)return;const d=done[s.dataset.ch];db.textContent=d?"✓ 読了済み（取り消す）":"この章を読了にする";db.classList.toggle("is-done",!!d)});
  }
  let heads=[];
  function buildTree(){
    const s=secs[cur];
    $("sCh").textContent=s.dataset.app?"APPENDIX":s.dataset.ch==="0"?"START":"CHAPTER "+s.dataset.ch;
    $("sTitle").textContent=s.dataset.title;
    tree.innerHTML="";heads=[];
    let li=null,sub=null;
    s.querySelectorAll("h3[id],h4[id]").forEach(h=>{
      const c=h.cloneNode(true);
      const sc=c.querySelector(".scope");const q=sc?sc.textContent:"";if(sc)sc.remove();
      const noEl=c.querySelector(".secno,.subno");const no=noEl?noEl.textContent:"";if(noEl)noEl.remove();
      const t=c.textContent.trim();
      const a=document.createElement("a");a.href="#"+h.id;
      if(h.tagName==="H3"){
        li=document.createElement("li");sub=null;
        a.className="l3";a.innerHTML=`${no?`<span class="no">${no}</span>`:""}<span></span>${q?`<span class="q">${q}</span>`:""}`;
        a.children[no?1:0].textContent=t;li.appendChild(a);tree.appendChild(li);
      }else{
        if(!li){li=document.createElement("li");tree.appendChild(li)}
        if(!sub){sub=document.createElement("ol");li.appendChild(sub)}
        const l=document.createElement("li");a.className="l4";a.innerHTML=`${no?`<span class="no">${no}</span>`:""}<span></span>`;
        a.lastChild.textContent=t;l.appendChild(a);sub.appendChild(l);
      }
      heads.push({h,a,li});
    });
    $("prevCh").disabled=cur===0;$("nextCh").disabled=cur===secs.length-1;
    spy();
  }
  function spy(){
    const y=window.scrollY+parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bar-h"))+30;
    let act=null;
    for(const x of heads){if(x.h.getBoundingClientRect().top+window.scrollY<=y)act=x;else break}
    heads.forEach(x=>{x.a.classList.toggle("on",x===act||(act&&x.a.classList.contains("l3")&&x.li===act.li));});
    tree.querySelectorAll(":scope>li").forEach(l=>l.classList.toggle("on",!!(act&&act.li===l)));
    const sec=secs[cur],r=sec.getBoundingClientRect();
    const total=sec.offsetHeight-window.innerHeight;const p=total>0?Math.min(1,Math.max(0,-r.top/total)):1;
    $("readbar").style.width=(p*100).toFixed(1)+"%";
    if(act){const ta=act.a,sb=$("side");const tr=ta.getBoundingClientRect(),sr=sb.getBoundingClientRect();if(tr.top<sr.top+80||tr.bottom>sr.bottom-60)sb.scrollTop+=tr.top-sr.top-sr.height/3}
  }
  let raf=0;window.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;spy()})},{passive:true});
  function show(i,target){
    cur=Math.max(0,Math.min(secs.length-1,i));
    secs.forEach((s,j)=>s.hidden=j!==cur);
    set("cur",cur);
    try{history.replaceState(null,"","#"+hid(secs[cur]))}catch(e){}
    buildTabs();buildTree();
    const ct=chtabs.querySelector('[aria-current="true"]');if(ct)ct.scrollIntoView({block:"nearest",inline:"nearest"});
    closeDrawer();
    if(target){const el=document.getElementById(target);if(el){el.scrollIntoView({block:"start"});if(el.tagName==="DFN"){el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash")}spy();return}}
    window.scrollTo(0,0);spy();
  }
  function goId(id){const el=document.getElementById(id);if(!el)return;const s=el.closest("section.ch");show(secs.indexOf(s),id)}
  function closeDrawer(){document.body.classList.remove("drawer")}
  $("menuBtn").addEventListener("click",()=>document.body.classList.toggle("drawer"));
  $("scrim").addEventListener("click",closeDrawer);
  $("prevCh").addEventListener("click",()=>show(cur-1));
  $("nextCh").addEventListener("click",()=>show(cur+1));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDrawer()});
  document.addEventListener("click",e=>{
    const g=e.target.closest("[data-go]");if(g){show(+g.dataset.go);return}
    const d=e.target.closest("[data-done]");if(d){const n=d.dataset.done;done[n]=!done[n];set("done",done);buildTabs();return}
    const a=e.target.closest("a[href^='#']");
    if(a){const id=a.getAttribute("href").slice(1);
      if(secs.some(s=>hid(s)===id)){e.preventDefault();show(secs.findIndex(s=>hid(s)===id));return}
      const el=document.getElementById(id);
      if(el){e.preventDefault();if(el.closest("section.ch")===secs[cur]){el.scrollIntoView({block:"start"});closeDrawer();if(el.tagName==="DFN"){el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash")}}else goId(id)}
    }
  });
  function fromHash(){
    const h=location.hash.slice(1);
    if(secs.some(s=>hid(s)===h)&&!/^c\d+$/.test(h)){show(secs.findIndex(s=>hid(s)===h));return true}
    const m=/^c(\d+)$/.exec(h);
    if(m){const i=secs.findIndex(s=>s.dataset.ch===m[1]);if(i>=0){show(i);return true}}
    if(h&&document.getElementById(h)){goId(h);return true}
    return false;
  }
  window.addEventListener("hashchange",fromHash);
  if(!fromHash())show(get("cur",0));
