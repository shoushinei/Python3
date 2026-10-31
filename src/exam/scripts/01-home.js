/* ---------- ホーム ---------- */
function home(){
  show("home");
  $("resumeBtn").hidden = !lsGet("cur", null);
  const H = lsGet("hist", []);
  if(!H.length){$("histBox").innerHTML = '<p class="empty">まだ記録はありません。</p>';return}
  let h = '<table><tr><th>受験日時</th><th>評価得点</th><th>結果</th><th class="hide-s">正答数</th><th class="hide-s">所要時間</th><th></th></tr>';
  H.slice().reverse().forEach((r,ri)=>{
    const i = H.length-1-ri;
    h += `<tr><td>${fmtDate(r.end)}</td><td class="n">${r.score}</td><td><span class="tag ${r.score>=PASS?"pass":"fail"}">${r.score>=PASS?"合格":"不合格"}</span></td><td class="hide-s">${r.correct} / ${N}</td><td class="hide-s">${fmtTime(r.used)}</td><td><button class="linkbtn" type="button" data-rv="${i}">結果と解説</button></td></tr>`;
  });
  $("histBox").innerHTML = h + "</table>";
}
$("histBox").addEventListener("click", e=>{const b=e.target.closest("[data-rv]");if(b)result(lsGet("hist",[])[+b.dataset.rv])});
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

