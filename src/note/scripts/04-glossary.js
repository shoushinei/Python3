  /* ---------- 用語ツールチップ ---------- */
  const GL=__GLOSSARY__;
  const pop=document.createElement("div");pop.id="glpop";pop.hidden=true;pop.setAttribute("role","tooltip");document.body.appendChild(pop);
  let pinned=null,curEl=null,hideT=0;
  function showGl(el){
    const d=GL[el.dataset.g];if(!d)return;
    clearTimeout(hideT);
    if(curEl&&curEl!==el)curEl.classList.remove("on");
    curEl=el;el.classList.add("on");
    pop.innerHTML="<b></b><span class='ds'></span>"+(d[1]?"<span class='jv'></span>":"");
    pop.querySelector("b").textContent=el.dataset.g;pop.querySelector(".ds").textContent=d[0];
    if(d[1])pop.querySelector(".jv").appendChild(document.createTextNode(d[1]));
    pop.hidden=false;
    const r=el.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
    let left=Math.min(Math.max(8,r.left),window.innerWidth-w-8);
    let top=r.bottom+8;if(top+h>window.innerHeight-8)top=r.top-h-8;
    pop.style.left=left+"px";pop.style.top=Math.max(8,top)+"px";
  }
  function hideGl(){pop.hidden=true;if(curEl)curEl.classList.remove("on");curEl=null;pinned=null}
  document.addEventListener("mouseover",e=>{const g=e.target.closest(".gl");if(g&&!pinned)showGl(g);else if(e.target.closest("#glpop"))clearTimeout(hideT)});
  document.addEventListener("mouseout",e=>{const g=e.target.closest(".gl,#glpop");if(g&&!pinned){hideT=setTimeout(hideGl,180)}});
  document.addEventListener("click",e=>{
    const g=e.target.closest(".gl");
    if(g){e.preventDefault();e.stopPropagation();if(pinned===g){hideGl()}else{showGl(g);pinned=g}return}
    if(!e.target.closest("#glpop"))hideGl();
  },true);
  document.addEventListener("focusin",e=>{const g=e.target.closest(".gl");if(g)showGl(g)});
  document.addEventListener("focusout",e=>{if(e.target.closest(".gl")&&!pinned)hideGl()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")hideGl()});
  window.addEventListener("scroll",()=>{if(!pop.hidden)hideGl()},{passive:true});

