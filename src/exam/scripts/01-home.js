/* ---------- ホーム ---------- */
function home(){
  show("home");
  $("resumeBtn").hidden = !lsGet("cur", null);
  const H = loadHist();
  $("exportBtn").disabled = !H.length;
  if(!H.length){$("histBox").innerHTML = '<p class="empty">まだ受験記録はありません。</p>';return}
  let h = '<table><tr><th>回</th><th>受験日時</th><th>評価得点</th><th>結果</th><th class="hide-s">正答数</th><th class="hide-s">所要時間</th><th></th></tr>';
  H.slice().reverse().forEach((r,ri)=>{
    const i = H.length-1-ri;
    h += `<tr><td class="no">${i+1}</td><td>${fmtDate(r.end)}${r.marks?'<span class="tag hand">手入力</span>':""}</td><td class="n">${r.score}</td><td><span class="tag ${r.score>=PASS?"pass":"fail"}">${r.score>=PASS?"合格":"不合格"}</span></td><td class="hide-s">${r.correct} / ${N}</td><td class="hide-s">${r.used===null?"－":fmtTime(r.used)}</td><td class="row-acts"><button class="linkbtn" type="button" data-rv="${i}">結果を開く</button><button class="linkbtn del" type="button" data-del="${i}" aria-label="第${i+1}回の記録を削除">削除</button></td></tr>`;
  });
  $("histBox").innerHTML = h + "</table>";
}
$("histBox").addEventListener("click", e=>{
  const b = e.target.closest("[data-rv]");
  if(b){result(loadHist()[+b.dataset.rv]);return}
  const d = e.target.closest("[data-del]");
  if(d) askDelete(+d.dataset.del);
});
function askDelete(i){
  const H = loadHist(), r = H[i];
  openModal("この記録を削除しますか？", `<p>第${i+1}回（${fmtDate(r.end)}・${r.score} 点）の記録を削除します。振り返りメモも一緒に消え、元に戻せません。</p>`, "削除する", ()=>{
    H.splice(i,1); saveHist(H); home();
    setRecMsg("記録を 1 回分削除しました。");
  });
}
$("startBtn").addEventListener("click", ()=>{
  if(lsGet("cur",null)){openModal("新しく始めますか？",'<p>途中の試験があります。新しく始めると、途中の回答は破棄されます。</p>',"新しく始める",start)}
  else start();
});
$("resumeBtn").addEventListener("click", ()=>{S = lsGet("cur", null); if(S) runExam()});

function start(){
  const now = Date.now();
  S = {start: now, deadline: now+LIMIT, perm: Q.map(q=>shuffle(q.opts.length)), ans: Array(N).fill(null), flag: Array(N).fill(false), cur: 0};
  lsSet("cur", S); runExam();
}

