(function(){
  const COURSES=__COURSES__;
  const read=(key,fallback)=>{try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}};

  document.querySelectorAll("[data-note]").forEach(el=>{
    const {prefix,titles,chapters}=COURSES[el.dataset.note].note;
    const cur=read(prefix+"cur",null);
    if(cur===null||!titles[cur])return;
    const done=read(prefix+"done",{});
    const count=chapters.filter(ch=>done[ch]).length;
    el.textContent=`続きから：${titles[cur]}（読了 ${count} / ${chapters.length}）`;
  });

  document.querySelectorAll("[data-exam]").forEach(el=>{
    const {prefix}=COURSES[el.dataset.exam].exam;
    const hist=read(prefix+"hist",[]);
    const parts=[];
    if(read(prefix+"cur",null))parts.push("途中の試験があります");
    if(hist.length){
      const scores=hist.map(r=>r.score);
      parts.push(`受験 ${hist.length} 回・前回 ${scores[scores.length-1]} 点・最高 ${Math.max(...scores)} 点`);
    }
    el.textContent=parts.join("／");
  });
})();
