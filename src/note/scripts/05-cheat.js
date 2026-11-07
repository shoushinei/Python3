  /* ---------- 暗記シート ---------- */
  // スマホではマスを縦に並べるので、列の見出しを各マスにも持たせておく
  document.querySelectorAll("table.drill").forEach(t=>{
    const heads=[...t.rows[0].cells].map(c=>c.textContent.trim());
    [...t.rows].slice(1).forEach(r=>[...r.cells].forEach((c,i)=>{if(heads[i])c.dataset.label=heads[i]}));
  });
  document.querySelectorAll("[data-drill]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const sec=btn.closest("section.ch");const on=btn.dataset.drill==="hide";
      sec.classList.toggle("drilling",on);
      sec.querySelectorAll("[data-drill]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
      sec.querySelectorAll("td.a.show").forEach(td=>td.classList.remove("show"));
    });
  });
  document.addEventListener("click",e=>{const td=e.target.closest(".drilling td.a");if(td)td.classList.toggle("show")});

