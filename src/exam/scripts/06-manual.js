/* ---------- 結果の手入力 ---------- */
let M = null;
const CYCLE = {1:0, 0:null, null:1};

function localInput(t){
  const d = new Date(t), p = v=>String(v).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
$("manualBtn").addEventListener("click", ()=>{
  M = {marks:Array(N).fill(1), flag:Array(N).fill(false), mode:"mark"};
  $("mWhen").value = localInput(Date.now());
  $("mMin").value = ""; $("mTimeout").checked = false; $("mErr").textContent = "";
  renderManual();
  $("manual").hidden = false; $("mWhen").focus();
});
function renderManual(){
  document.querySelectorAll("#mMode button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.mode===M.mode));
  let h = "";
  M.marks.forEach((v,i)=>{
    const st = v===null ? "un" : v ? "ok" : "ng";
    h += `<button type="button" class="cell st ${st}${M.flag[i]?" fl":""}" data-i="${i}" aria-label="問題${i+1} ${MARK[st][1]}${M.flag[i]?" 見直し":""}">${i+1}<span aria-hidden="true">${MARK[st][0]}</span></button>`;
  });
  $("mGrid").innerHTML = h;
  const ok = M.marks.filter(v=>v===1).length, ng = M.marks.filter(v=>v===0).length, un = N-ok-ng;
  $("mSum").textContent = `○ ${ok}　× ${ng}　未回答 ${un}　見直しマーク ${M.flag.filter(Boolean).length}　→ ${Math.round(ok/N*1000)} / 1000（${Math.round(ok/N*100)}%）`;
}
$("mGrid").addEventListener("click", e=>{
  const c = e.target.closest("[data-i]"); if(!c) return;
  const i = +c.dataset.i;
  if(M.mode==="mark") M.marks[i] = CYCLE[M.marks[i]];
  else M.flag[i] = !M.flag[i];
  renderManual();
  $("mGrid").querySelector(`[data-i="${i}"]`).focus();
});
$("mMode").addEventListener("click", e=>{const b=e.target.closest("[data-mode]"); if(b){M.mode=b.dataset.mode; renderManual()}});
$("mAllOk").addEventListener("click", ()=>{M.marks.fill(1); renderManual()});
$("mAllNg").addEventListener("click", ()=>{M.marks.fill(0); renderManual()});
function closeManual(){if($("manual").hidden) return; $("manual").hidden = true; $("manualBtn").focus()}
$("mCancel").addEventListener("click", closeManual);
$("mSave").addEventListener("click", ()=>{
  const end = new Date($("mWhen").value).getTime();
  if(!Number.isFinite(end)){$("mErr").textContent = "受けた日時を入力してください。"; $("mWhen").focus(); return}
  const raw = $("mMin").value.trim(), min = Number(raw);
  if(raw && !(min>=0)){$("mErr").textContent = "かかった時間は 0 以上の数で入力してください。"; $("mMin").focus(); return}
  const used = raw ? Math.round(min*60000) : null;
  const rec = withScore({start:end-(used||0), end, used, timeout:$("mTimeout").checked, marks:M.marks, flag:M.flag, memo:{}});
  const H = loadHist();
  if(H.some(r=>recKey(r)===recKey(rec))){$("mErr").textContent = "同じ日時と内容の記録がすでにあります。"; return}
  H.push(rec); H.sort((a,b)=>a.end-b.end);
  if(!saveHist(H)){$("mErr").textContent = "保存できませんでした。ブラウザの保存領域を確認してください。"; return}
  $("manual").hidden = true;
  result(rec);
});
document.addEventListener("keydown", e=>{if(e.key==="Escape") closeManual()});

