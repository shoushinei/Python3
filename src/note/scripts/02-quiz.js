  /* ---------- 確認問題 ---------- */
  document.querySelectorAll(".quiz").forEach(q=>{
    const ans=q.dataset.answer,exp=q.querySelector(".exp");
    q.querySelectorAll(".opts li").forEach(li=>{
      const k=li.dataset.k,b=document.createElement("button");b.type="button";
      const isJp=!li.classList.contains("code");
      b.innerHTML='<span class="k">'+k.toUpperCase()+'</span><span class="v'+(isJp?' jp':'')+'"></span>';
      b.querySelector(".v").innerHTML=li.innerHTML;li.textContent="";li.appendChild(b);
      b.addEventListener("click",()=>{
        if(q.dataset.done)return;
        q.dataset.done=k===ans?"ok":"ng";
        q.querySelectorAll(".opts button").forEach(x=>{const xk=x.closest("li").dataset.k;if(xk===ans)x.classList.add("right");else if(x===b)x.classList.add("wrong");x.disabled=true});
        const v=document.createElement("span");v.className="verdict";v.textContent=k===ans?"正解！":"不正解。正解は "+ans.toUpperCase()+"。";
        exp.prepend(v);if(k!==ans)exp.classList.add("ng");exp.hidden=false;
        const sec=q.closest("section"),qs=[...sec.querySelectorAll(".quiz")],an=qs.filter(x=>x.dataset.done);
        const el=sec.querySelector(".qscore");if(el)el.textContent=`${an.filter(x=>x.dataset.done==="ok").length} / ${qs.length} 問正解`;
      });
    });
  });

