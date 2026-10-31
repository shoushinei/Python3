  /* ---------- 用語チェック ---------- */
  let got=get("terms",{});
  function updTerms(){
    const lis=[...document.querySelectorAll(".termlist li")];
    lis.forEach(li=>{const k=li.dataset.t;const on=!!got[k];li.classList.toggle("got",on);li.querySelector("input").checked=on});
    const c=$("tcount");if(c)c.textContent=`覚えた用語 ${lis.filter(l=>got[l.dataset.t]).length} / ${lis.length}`;
  }
  document.addEventListener("change",e=>{const i=e.target.closest(".termlist input");if(!i)return;const k=i.closest("li").dataset.t;got[k]=i.checked;set("terms",got);updTerms()});
  updTerms();



