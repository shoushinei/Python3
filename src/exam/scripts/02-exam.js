/* ---------- 試験 ---------- */
function runExam(){
  show("exam"); renderGrid(); renderQ();
  clearInterval(tick); tick = setInterval(updTimer, 500); updTimer();
}
function updTimer(){
  const left = S.deadline - Date.now();
  $("timer").textContent = fmtTime(left);
  $("timer").classList.toggle("low", left < 5*60*1000);
  if(left <= 0){clearInterval(tick); finish(true)}
}
function save(){lsSet("cur", S)}
function renderQ(){
  const i = S.cur, q = Q[i], p = S.perm[i];
  let h = `<div class="qhead"><span class="qno">問題 ${i+1}<small> / ${N}</small></span>
    <button class="flagbtn" id="flagBtn" type="button" aria-pressed="${S.flag[i]}">${S.flag[i]?"★ 見直し":"☆ 見直し"}</button></div>
    <div class="qtext">${q.q}</div>`;
  if(q.code) h += `<pre><code>${q.code}</code></pre>`;
  h += '<ul class="optlist" role="radiogroup" aria-label="選択肢">';
  p.forEach((o,k)=>{
    const [t,mono] = q.opts[o];
    h += `<li><button type="button" class="opt" role="radio" aria-checked="${S.ans[i]===o}" data-o="${o}"><span class="l">${L[k]}</span><span class="t${mono?" mono":""}">${t}</span></button></li>`;
  });
  h += `</ul><div class="qnav"><button class="btn" type="button" id="prevBtn" ${i===0?"disabled":""}>← 前の問題</button>
    ${i===N-1?'<button class="btn primary" type="button" id="lastEnd">試験を終了して採点</button>':'<button class="btn primary" type="button" id="nextBtn">次の問題 →</button>'}</div>`;
  $("qcard").innerHTML = h;
  $("ansCnt").textContent = S.ans.filter(a=>a!==null).length;
}
function renderGrid(){
  let h = "";
  for(let i=0;i<N;i++) h += `<button type="button" class="cell${S.ans[i]!==null?" ans":""}${S.flag[i]?" fl":""}${i===S.cur?" cur":""}" data-go="${i}" aria-label="問題${i+1}${S.ans[i]!==null?" 回答済み":" 未回答"}${S.flag[i]?" 見直し":""}">${i+1}</button>`;
  $("grid").innerHTML = h;
}
function go(i){if(i<0||i>=N)return; S.cur=i; save(); renderQ(); renderGrid(); document.body.classList.remove("showgrid"); $("qcard").scrollIntoView({block:"nearest"})}
function choose(o){S.ans[S.cur] = o; save(); renderQ(); renderGrid()}
function toggleFlag(){S.flag[S.cur] = !S.flag[S.cur]; save(); renderQ(); renderGrid()}
$("qcard").addEventListener("click", e=>{
  const o = e.target.closest(".opt"); if(o){choose(+o.dataset.o); return}
  if(e.target.closest("#flagBtn")) toggleFlag();
  else if(e.target.closest("#prevBtn")) go(S.cur-1);
  else if(e.target.closest("#nextBtn")) go(S.cur+1);
  else if(e.target.closest("#lastEnd")) askEnd();
});
$("grid").addEventListener("click", e=>{const c=e.target.closest("[data-go]"); if(c) go(+c.dataset.go)});
$("listBtn").addEventListener("click", ()=>document.body.classList.toggle("showgrid"));
$("endBtn").addEventListener("click", askEnd);
document.addEventListener("keydown", e=>{
  if($("exam").hidden || !$("confirm").hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  if(e.key==="ArrowRight") go(S.cur+1);
  else if(e.key==="ArrowLeft") go(S.cur-1);
  else if(e.key==="f"||e.key==="F") toggleFlag();
  else if(/^[1-5]$/.test(e.key)){const k=+e.key-1, p=S.perm[S.cur]; if(k<p.length) choose(p[k])}
});

