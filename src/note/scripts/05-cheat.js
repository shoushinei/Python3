  /* ---------- 暗記シート ---------- */
  /* 表はそのまま残し、範囲の目次・たたみ・絞り込み・覚えた印・カードで覚える を足す。 */
  let known=get("cheat-known",{});
  const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const hash=s=>{let h=0;for(const c of s)h=(h*31+c.codePointAt(0))|0;return(h>>>0).toString(36)};
  const headText=h=>{const c=h.cloneNode(true);c.querySelectorAll(".scope,.secno,.subno").forEach(x=>x.remove());return c.textContent.trim()};

  document.querySelectorAll("section.cheat").forEach(sec=>{
    const groups=[];
    sec.querySelectorAll("table.drill").forEach(t=>{
      const box=t.closest(".tbl");
      let h=box.previousElementSibling;while(h&&!/^H[34]$/.test(h.tagName))h=h.previousElementSibling;
      let h3=h;while(h3&&h3.tagName!=="H3")h3=h3.previousElementSibling;
      const g={id:h.id,head:h,box,title:headText(h),parent:h===h3?"":headText(h3),scope:(h3.querySelector(".scope")||{}).textContent||"",rows:[]};
      t.rows[0].insertAdjacentHTML("beforeend",'<th class="mk">覚えた</th>');
      [...t.rows].slice(1).forEach(tr=>{
        const c=tr.cells;
        // スマホではマスを縦に並べるので、列の見出しを各マスにも持たせておく
        [...c].forEach((td,i)=>{const lb=t.rows[0].cells[i].textContent.trim();if(lb)td.dataset.label=lb});
        const r={tr,g,id:g.id+":"+hash(c[0].textContent),q:c[0].innerHTML,a:c[1].innerHTML,note:c[2]?c[2].innerHTML:"",
          noteLabel:c[2]?c[2].dataset.label||"":"",trap:t.classList.contains("pairs")||!!(c[2]&&(c[2].classList.contains("trap")||c[2].querySelector(".qreal")))};
        tr.insertAdjacentHTML("beforeend",'<td class="mk"><button type="button" class="mk-btn" aria-pressed="false"><span aria-hidden="true">✓</span> 覚えた</button></td>');
        r.btn=tr.lastChild.firstChild;
        g.rows.push(r);
      });
      const bar=document.createElement("div");bar.className="kg-bar";
      bar.innerHTML='<button type="button" class="kg-toggle" aria-expanded="false"></button><button type="button" class="kg-card">カード</button>';
      h.after(bar);g.bar=bar;g.toggle=bar.firstChild;
      box.id="kgb-"+g.id;g.toggle.setAttribute("aria-controls",box.id);
      groups.push(g);
    });
    if(!groups.length)return;
    const rows=groups.flatMap(g=>g.rows);
    const filters={all:["すべて",()=>true],todo:["まだ",r=>!known[r.id]],trap:["要注意",r=>r.trap]};
    let filter=filters[get("cheat-filter","all")]?get("cheat-filter","all"):"all";

    // 上に付いてくる操作バーと、範囲の目次
    const kbar=document.createElement("div");kbar.className="kbar";
    kbar.innerHTML=`<div class="seg kfilter" role="group" aria-label="表示する問題">${Object.entries(filters).map(([k,[l]])=>`<button type="button" data-kf="${k}">${l}<small></small></button>`).join("")}</div>
      <button type="button" class="khide" aria-pressed="false"><span class="lg">答えを</span>隠す</button><button type="button" class="kto-index">範囲</button>`;
    const index=document.createElement("div");index.className="kindex";
    index.innerHTML=`<div class="ki-head"><b>範囲</b><span class="ki-sum"></span><button type="button" class="ki-open" data-open="1">すべて開く</button><button type="button" class="ki-open" data-open="0">閉じる</button></div>
      <button type="button" class="kcard-all"></button><ul class="ki-list"></ul>
      <p class="ki-foot">覚えた印はこのブラウザに保存されます。<button type="button" class="ki-reset">覚えた印をすべて消す</button></p>`;
    const old=sec.querySelector(".drillbar");
    if(old)old.replaceWith(kbar,index);else groups[0].head.before(kbar,index);
    const list=index.querySelector(".ki-list");
    let lastParent=null;
    groups.forEach((g,i)=>{
      if(g.parent&&g.parent!==lastParent)list.insertAdjacentHTML("beforeend",`<li class="ki-parent">${esc(g.parent)}${g.scope?`<span>${esc(g.scope)}</span>`:""}</li>`);
      lastParent=g.parent;
      const li=document.createElement("li");if(g.parent)li.className="ki-sub";
      li.innerHTML=`<button type="button" class="ki-item" data-g="${i}"><span class="ki-t">${esc(g.title)}</span>${!g.parent&&g.scope?`<span class="ki-q">${esc(g.scope)}</span>`:""}<span class="ki-n"></span><span class="ki-p"><i></i></span></button>`;
      g.item=li.firstChild;list.appendChild(li);
    });

    const match=r=>filters[filter][1](r);
    function setOpen(g,open){
      g.open=open;g.box.hidden=!open;g.toggle.setAttribute("aria-expanded",String(open));
    }
    function refresh(){
      kbar.querySelectorAll("[data-kf]").forEach(b=>{b.setAttribute("aria-pressed",String(b.dataset.kf===filter));b.querySelector("small").textContent=rows.filter(filters[b.dataset.kf][1]).length});
      const knownAll=rows.filter(r=>known[r.id]).length;
      index.querySelector(".ki-sum").textContent=`覚えた ${knownAll} / ${rows.length}`;
      groups.forEach(g=>{
        const shown=g.rows.filter(match),k=g.rows.filter(r=>known[r.id]).length;
        g.rows.forEach(r=>{r.tr.hidden=!match(r);r.btn.setAttribute("aria-pressed",String(!!known[r.id]));r.tr.classList.toggle("is-known",!!known[r.id])});
        g.shown=shown;
        g.item.querySelector(".ki-n").textContent=filter==="all"?`${k} / ${g.rows.length}`:`${shown.length}問`;
        g.item.querySelector(".ki-p i").style.width=`${k/g.rows.length*100}%`;
        g.item.disabled=!shown.length;
        g.toggle.innerHTML=`<span class="kg-chev" aria-hidden="true"></span>${g.open?"閉じる":"開く"}<span class="kg-n">${shown.length}問・覚えた ${k}/${g.rows.length}</span>`;
        g.bar.querySelector(".kg-card").disabled=!shown.length;
        [g.bar,g.box].forEach(e=>e.classList.toggle("is-empty",!shown.length));
      });
      const n=rows.filter(match).length;
      const ca=index.querySelector(".kcard-all");ca.disabled=!n;
      ca.innerHTML=`<span aria-hidden="true">▶</span> カードで覚える<small>${filter==="all"?"全範囲":filters[filter][0]}の ${n}問</small>`;
    }
    groups.forEach(g=>setOpen(g,false));
    refresh();

    function openOnly(g){groups.forEach(x=>setOpen(x,x===g));refresh();g.head.scrollIntoView({block:"start"})}
    function openFor(el){const g=groups.find(x=>x.head===el||x.box.contains(el)||x.bar.contains(el));if(g&&!g.open){setOpen(g,true);refresh()}}
    // 目次や他の章のリンクから、たたんだ範囲の中へ移るときは先に開く
    document.addEventListener("click",e=>{const a=e.target.closest("a[href^='#']");if(a){const el=document.getElementById(a.getAttribute("href").slice(1));if(el&&sec.contains(el))openFor(el)}},true);
    window.addEventListener("hashchange",()=>{const el=document.getElementById(location.hash.slice(1));if(el&&sec.contains(el))openFor(el)});
    {const el=document.getElementById(location.hash.slice(1));if(el&&sec.contains(el)){const g=groups.find(x=>x.head===el);if(g){setOpen(g,true);refresh()}}}

    function mark(r,v){if(v)known[r.id]=1;else delete known[r.id];set("cheat-known",known)}
    sec.addEventListener("click",e=>{
      const t=e.target;
      const kf=t.closest("[data-kf]");if(kf){filter=kf.dataset.kf;set("cheat-filter",filter);refresh();return}
      if(t.closest(".khide")){const on=!sec.classList.contains("drilling");sec.classList.toggle("drilling",on);t.closest(".khide").setAttribute("aria-pressed",String(on));sec.querySelectorAll("td.a.show").forEach(td=>td.classList.remove("show"));return}
      if(t.closest(".kto-index")){index.scrollIntoView({block:"start"});return}
      const it=t.closest(".ki-item");if(it){openOnly(groups[+it.dataset.g]);return}
      const op=t.closest(".ki-open");if(op){groups.forEach(g=>setOpen(g,op.dataset.open==="1"));refresh();return}
      if(t.closest(".kcard-all")){deck.open(rows.filter(match),filter==="all"?"全範囲":filters[filter][0]);return}
      if(t.closest(".ki-reset")){if(confirm("覚えた印をすべて消しますか？")){known={};set("cheat-known",known);refresh()}return}
      const g=groups.find(x=>x.bar.contains(t));
      if(g&&t.closest(".kg-toggle")){setOpen(g,!g.open);refresh();return}
      if(g&&t.closest(".kg-card")){deck.open(g.shown,g.parent?`${g.parent}・${g.title}`:g.title);return}
      const mb=t.closest(".mk-btn");if(mb){const r=rows.find(x=>x.btn===mb);mark(r,!known[r.id]);refresh();return}
    });

    // カードで覚える：1問ずつ、答えを見てから「まだ」か「覚えた」を選ぶ
    const deck=(()=>{
      const el=document.createElement("div");el.className="kdeck";el.hidden=true;
      el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label","カードで覚える");
      el.innerHTML=`<div class="kd-in">
        <div class="kd-top"><button type="button" class="kd-close" aria-label="閉じる">×</button><span class="kd-where"></span><span class="kd-pos"></span><button type="button" class="kd-shuffle" aria-pressed="false">シャッフル</button></div>
        <div class="kd-track"><i></i></div>
        <div class="kd-card" tabindex="-1"></div>
        <div class="kd-acts"></div>
      </div>`;
      document.body.appendChild(el);
      const card=el.querySelector(".kd-card"),acts=el.querySelector(".kd-acts");
      let base=[],list=[],pos=0,shown=false,label="",res={},lastFocus=null;
      function render(){
        el.querySelector(".kd-where").textContent=label;
        if(pos>=list.length){
          const ok=list.filter(r=>known[r.id]).length,left=list.filter(r=>!known[r.id]);
          el.querySelector(".kd-pos").textContent=`${list.length} / ${list.length}`;
          el.querySelector(".kd-track i").style.width="100%";
          card.innerHTML=`<div class="kd-end"><b>おつかれさまでした</b><p>${list.length}問のうち、覚えた印が付いているのは <strong>${ok}問</strong> です。</p></div>`;
          acts.innerHTML=`${left.length?`<button type="button" class="kd-btn primary" data-kd="again">まだの ${left.length}問をもう一度</button>`:""}<button type="button" class="kd-btn" data-kd="restart">最初から</button><button type="button" class="kd-btn" data-kd="close">閉じる</button>`;
          return;
        }
        const r=list[pos];
        el.querySelector(".kd-pos").textContent=`${pos+1} / ${list.length}`;
        el.querySelector(".kd-track i").style.width=`${pos/list.length*100}%`;
        const gname=r.g.parent?`${r.g.parent}・${r.g.title}`:r.g.title;
        card.innerHTML=`<div class="kd-g">${gname===label?"":esc(gname)}${known[r.id]?'<span class="kd-known">覚えた</span>':""}</div>
          <div class="kd-q">${r.q}</div>
          ${shown?`<div class="kd-a">${r.a}</div>${r.note?`<div class="kd-note${r.trap?" trap":""}">${r.noteLabel?`<span>${esc(r.noteLabel)}</span>`:""}${r.note}</div>`:""}`:'<button type="button" class="kd-reveal" data-kd="reveal">タップして答えを見る</button>'}`;
        acts.innerHTML=shown
          ?`<button type="button" class="kd-btn todo" data-kd="todo">まだ</button><button type="button" class="kd-btn primary" data-kd="ok"><span aria-hidden="true">✓</span> 覚えた</button>`
          :`<button type="button" class="kd-btn" data-kd="prev"${pos?"":" disabled"}>← 前</button><button type="button" class="kd-btn" data-kd="skip">とばす →</button>`;
      }
      function go(p){pos=Math.max(0,Math.min(list.length,p));shown=false;render();card.focus({preventScroll:true})}
      function start(l){list=el.querySelector(".kd-shuffle").getAttribute("aria-pressed")==="true"?l.slice().sort(()=>Math.random()-.5):l.slice();go(0)}
      function open(l,lb){
        if(!l.length)return;base=l;label=lb;lastFocus=document.activeElement;
        el.hidden=false;document.body.classList.add("kdeck-open");start(base);
      }
      function close(){el.hidden=true;document.body.classList.remove("kdeck-open");refresh();if(lastFocus)lastFocus.focus({preventScroll:true})}
      function act(k){
        if(k==="reveal"){shown=true;render();return}
        if(k==="ok"||k==="todo"){mark(list[pos],k==="ok");go(pos+1);return}
        if(k==="prev")go(pos-1);else if(k==="skip")go(pos+1);
        else if(k==="again")start(list.filter(r=>!known[r.id]));
        else if(k==="restart")start(base);
        else if(k==="close")close();
      }
      el.addEventListener("click",e=>{
        const b=e.target.closest("[data-kd]");if(b){act(b.dataset.kd);return}
        if(e.target.closest(".kd-close")){close();return}
        const sh=e.target.closest(".kd-shuffle");if(sh){sh.setAttribute("aria-pressed",String(sh.getAttribute("aria-pressed")!=="true"));start(base);return}
        if(!shown&&pos<list.length&&e.target.closest(".kd-card"))act("reveal");
      });
      // 横にスワイプで前後へ
      let sx=null,sy=0;
      card.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
      card.addEventListener("touchend",e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)go(pos+(dx<0?1:-1))});
      document.addEventListener("keydown",e=>{
        if(el.hidden)return;
        if(e.key==="Escape"){close();return}
        if(pos>=list.length)return;
        if(e.key===" "||e.key==="Enter"){if(!shown&&!e.target.closest("button")){e.preventDefault();act("reveal")}}
        else if(e.key==="ArrowRight")go(pos+1);
        else if(e.key==="ArrowLeft")go(pos-1);
        else if(shown&&(e.key==="1"||e.key==="2"))act(e.key==="2"?"ok":"todo");
      });
      return {open};
    })();
  });

  // 答えを隠したマスは、押すと表示する
  document.addEventListener("click",e=>{const td=e.target.closest(".drilling td.a");if(td)td.classList.toggle("show")});
