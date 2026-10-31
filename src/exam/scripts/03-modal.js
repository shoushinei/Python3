/* ---------- モーダル ---------- */
let modalYes = null;
function openModal(title, body, yesLabel, fn){
  $("cfTitle").textContent = title; $("cfBody").innerHTML = body; $("cfYes").textContent = yesLabel; modalYes = fn;
  $("confirm").hidden = false; $("cfNo").focus();
}
function closeModal(){$("confirm").hidden = true}
$("cfNo").addEventListener("click", closeModal);
$("cfYes").addEventListener("click", ()=>{closeModal(); modalYes && modalYes()});
$("confirm").addEventListener("click", e=>{if(e.target.id==="confirm") closeModal()});
document.addEventListener("keydown", e=>{if(e.key==="Escape"){closeModal(); document.body.classList.remove("showgrid")}});
function askEnd(){
  const un = S.ans.filter(a=>a===null).length, fl = S.flag.filter(Boolean).length;
  let b = `<p>残り時間 <b>${fmtTime(S.deadline-Date.now())}</b></p>`;
  b += un ? `<p class="warnline">未回答の問題が ${un} 問あります。</p>` : "<p>すべての問題に回答済みです。</p>";
  if(fl) b += `<p>見直しマークの付いた問題が ${fl} 問あります。</p>`;
  b += "<p>終了すると、回答は変更できません。</p>";
  openModal("試験を終了しますか？", b, "終了して採点", ()=>finish(false));
}

