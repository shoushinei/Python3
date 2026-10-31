(function(){
  const COURSES=__COURSES__;
  const read=(key,fallback)=>{try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}};
  const list=document.getElementById("resumeList");

  function addResume(what,detail,href,label){
    const li=document.createElement("li");
    const box=document.createElement("div");box.className="resume-what";
    const b=document.createElement("b");b.textContent=what;
    const span=document.createElement("span");span.textContent=detail;
    box.append(b,span);
    const a=document.createElement("a");a.className="btn";a.href=href;a.textContent=label;
    li.append(box,a);list.appendChild(li);
  }

  for(const [id,c] of Object.entries(COURSES)){
    const {prefix,titles,chapters,title}=c.note;
    const cur=read(prefix+"cur",null);
    if(cur!==null&&titles[cur]){
      const done=read(prefix+"done",{});
      const count=chapters.filter(ch=>done[ch]).length;
      addResume(`${c.shortName}の教材`,`${titles[cur]}・読了 ${count} / ${chapters.length} 章`,`${id}/note/index.html`,"続きから読む");

      const box=document.querySelector(`[data-progress="${id}"]`);
      box.querySelector(".progress-text").textContent=`${title}：読了 ${count} / ${chapters.length} 章`;
      box.querySelector(".progress-track i").style.width=`${chapters.length?count/chapters.length*100:0}%`;
      box.hidden=false;
      document.querySelector(`[data-note-link="${id}"]`).textContent="続きから読む";
    }
    if(!c.exam)continue;
    const unfinished=read(c.exam.prefix+"cur",null);
    const hist=read(c.exam.prefix+"hist",[]);
    if(!unfinished&&!hist.length)continue;
    const scores=hist.map(r=>r.score);
    const parts=[];
    if(unfinished)parts.push("途中の試験があります");
    if(hist.length)parts.push(`受験 ${hist.length} 回・前回 ${scores[scores.length-1]} 点・最高 ${Math.max(...scores)} 点`);
    addResume(`${c.shortName}の模試`,parts.join("／"),`${id}/exam/index.html`,unfinished?"模試を再開する":"模試を開く");
  }
  if(list.children.length)document.getElementById("resume").hidden=false;
})();
