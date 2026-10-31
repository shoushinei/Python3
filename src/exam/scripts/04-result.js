/* ---------- 採点 ---------- */
function finish(timeout){
  clearInterval(tick);
  const end = Math.min(Date.now(), S.deadline);
  const rec = withScore({start:S.start, end, used:end-S.start, timeout, ans:S.ans, perm:S.perm, flag:S.flag, memo:{}});
  const H = loadHist(); H.push(rec); saveHist(H);
  lsDel("cur"); S = null;
  result(rec);
}

/* ---------- 振り返り ---------- */
const FILTERS = [["all","すべて"],["ng","不正解・未回答"],["ok","正解"],["fl","見直しマーク"]];
const MARK = {ok:["○","正解"], ng:["×","不正解"], un:["－","未回答"]};
let RV = null;

function result(r){
  r = {...r, memo:r.memo||{}};
  const no = loadHist().findIndex(x=>recKey(x)===recKey(r))+1;
  RV = {r, no, view:"summary", filter:"all"};
  show("result");
  $("rvNo").textContent = `第${no}回`;
  $("rvScore").textContent = `${r.score} / 1000`;
  renderReview();
}
function matches(i, f){
  const st = statusOf(RV.r, i);
  return f==="all" || (f==="ok" ? st==="ok" : f==="ng" ? st!=="ok" : !!RV.r.flag[i]);
}
function filtered(f){return Q.map((_,i)=>i).filter(i=>matches(i,f))}
function renderReview(){renderSide(); if(RV.view==="summary") renderSummary(); else renderItem(RV.view)}
function renderSide(){
  const {r, view, filter} = RV;
  $("rvSummaryBtn").setAttribute("aria-pressed", view==="summary");
  $("rvFilters").innerHTML = FILTERS.map(([f,label])=>`<button type="button" data-f="${f}" aria-pressed="${f===filter}">${label}<small>${filtered(f).length}</small></button>`).join("");
  let h = "";
  Q.forEach((_,i)=>{
    const st = statusOf(r,i);
    h += `<button type="button" class="cell st ${st}${r.flag[i]?" fl":""}${i===view?" cur":""}${matches(i,filter)?"":" dim"}" data-go="${i}" aria-label="問題${i+1} ${MARK[st][1]}${r.flag[i]?" 見直し":""}"${i===view?' aria-current="true"':""}>${i+1}<span aria-hidden="true">${MARK[st][0]}</span></button>`;
  });
  $("rvGrid").innerHTML = h;
}
function renderSummary(){
  const {r, no} = RV, pass = r.score>=PASS;
  const by = {};
  Q.forEach((q,i)=>{(by[q.ch] ||= {n:0,c:0}).n++; if(statusOf(r,i)==="ok") by[q.ch].c++});
  const wrong = filtered("ng").length;
  let h = `<div class="report">
    <div class="scorebox">
      <div class="score"><b>${r.score}</b><span> / 1000</span></div>
      <div class="sum-text">
        <div class="verdict ${pass?"pass":"fail"}">${pass?"合格ライン到達":"合格ラインに未到達"}</div>
        <p class="meta">第${no}回・${fmtDate(r.end)} に受験${r.marks?"（手入力）":""}<br>
        正答率 <b>${Math.round(r.correct/N*100)}%</b>（合格 ${PASS} 点 = ${Math.round(PASS/10)}%）${pass?"":`　合格まであと <b>${Math.max(0,Math.ceil(PASS*N/1000)-r.correct)}</b> 問`}<br>
        所要時間 ${r.used===null?"未入力":`<b>${fmtTime(r.used)}</b> / ${EXAM.limitMinutes}:00`}${r.timeout?"（時間切れ）":""}</p>
      </div>
    </div>
    <div class="meterline"><i style="width:${r.score/10}%"></i><em style="left:${PASS/10}%"></em></div>
    <div class="meterlbl"><span style="left:${PASS/10}%">合格 ${PASS}</span></div>
  </div>
  <div class="tiles">
    <div class="tile ok"><b><span aria-hidden="true">○</span> ${filtered("ok").length}</b><span>正解</span></div>
    <div class="tile ng"><b><span aria-hidden="true">×</span> ${wrong}</b><span>不正解・未回答</span></div>
    <div class="tile fl"><b>${filtered("fl").length}</b><span>見直しマーク</span></div>
  </div>
  <div class="secan"><h3>章ごとの正答率<small>章名を押すと教材のその章を開きます</small></h3>
  <table><tr><th>章</th><th>正解 / 問題数</th><th style="width:44%">正答率</th></tr>`;
  Object.keys(CHN).sort((a,b)=>a-b).forEach(c=>{
    const v = by[c], pct = Math.round(v.c/v.n*100);
    h += `<tr><td><a href="${NOTE}#c${c}" target="_blank" rel="noopener">第${c}章 ${CHN[c]}</a></td><td class="n">${v.c} / ${v.n}</td><td><div class="bar"><span class="tr"><i class="${pct>=70?"":pct>=50?"mid":"low"}" style="width:${pct}%"></i></span><b>${pct}%</b></div></td></tr>`;
  });
  h += `</table></div>
  <div class="r-acts">
    <button class="btn primary" type="button" data-act="first">問1から見直す</button>
    <button class="btn" type="button" data-act="wrong"${wrong?"":" disabled"}>間違えた問題だけ見直す</button>
    <button class="btn" type="button" data-act="again">もう一度受験する</button>
  </div>`;
  $("rvMain").innerHTML = h;
}
function renderItem(i){
  const {r, filter} = RV, q = Q[i], st = statusOf(r,i);
  const order = r.perm ? r.perm[i] : q.opts.map((_,k)=>k);
  const list = filtered(filter), prev = [...list].reverse().find(x=>x<i), next = list.find(x=>x>i);
  let h = `<article class="ritem ${st}"><div class="rh"><span class="qno">問題 ${i+1}<small> / ${N}</small></span>
    <span class="mark ${st}"><span aria-hidden="true">${MARK[st][0]}</span> ${MARK[st][1]}</span>${r.flag[i]?'<span class="mark fl">見直し</span>':""}
    <span class="rh-ch">第${q.ch}章 ${CHN[q.ch]}・${q.opts.length}択</span></div>
    <div class="qtext">${q.q}</div>${q.code?`<pre><code>${q.code}</code></pre>`:""}
    <h3 class="rv-h">選択肢の解説</h3><ul class="optlist">`;
  order.forEach((o,k)=>{
    const [t,mono] = q.opts[o], right = o===q.ans, mine = !r.marks && o===r.ans[i];
    h += `<li><div class="opt${right?" right":mine?" wrong":""}"><span class="l">${L[k]}</span>
      <div class="opt-body"><span class="t${mono?" mono":""}">${t}</span><span class="why">${q.why[o]}</span></div>
      <span class="tags">${right?'<span class="tag pass">正解</span>':""}${mine?'<span class="you">あなたの回答</span>':""}</span></div></li>`;
  });
  h += `</ul>
    <div class="exp"><h3 class="rv-h">解説</h3><p>${q.exp}</p></div>
    <div class="topic"><h3 class="rv-h"><span class="topic-tag">論点</span>${q.topic}</h3><ul>${q.points.map(p=>`<li>${p}</li>`).join("")}</ul>
      ${q.sample?`<pre class="sample"><code>${q.sample}</code></pre>`:""}
      <p class="trap"><b>試験での注意</b>${q.trap}</p>
      <a class="note-link" href="${NOTE}#${q.sec}" target="_blank" rel="noopener">教材 ${q.secLabel} で復習する →</a></div>
    <div class="memo"><label class="rv-h" for="rvMemo">振り返りメモ</label>
      <textarea id="rvMemo" rows="3" placeholder="間違えた理由や、次に気をつけることを書いておけます"></textarea>
      <p class="memo-state" id="rvMemoState" role="status">入力すると自動で保存します。記録を書き出すと、メモも一緒に移せます。</p></div>
    <div class="qnav"><button class="btn" type="button" data-go="${prev===undefined?"":prev}"${prev===undefined?" disabled":""}>← 前の問題</button>
      ${next===undefined?'<button class="btn primary" type="button" data-act="summary">結果の概要へ</button>':`<button class="btn primary" type="button" data-go="${next}">次の問題 →</button>`}</div>
  </article>`;
  $("rvMain").innerHTML = h;
  $("rvMemo").value = r.memo[i] || "";
}
function viewItem(i){
  RV.view = i; renderReview();
  document.body.classList.remove("showgrid");
  window.scrollTo(0,0); $("rvMain").focus({preventScroll:true});
}
function viewSummary(){RV.view = "summary"; renderReview(); document.body.classList.remove("showgrid"); window.scrollTo(0,0)}
function saveMemo(i, text){
  const H = loadHist(), rec = H.find(x=>recKey(x)===recKey(RV.r));
  const memo = RV.r.memo;
  if(text.trim()) memo[i] = text; else delete memo[i];
  if(rec){rec.memo = memo; if(!saveHist(H)) $("rvMemoState").textContent = "保存できませんでした。ブラウザの保存領域を確認してください。"}
}
$("rvMain").addEventListener("click", e=>{
  const g = e.target.closest("[data-go]");
  if(g){if(g.dataset.go!=="") viewItem(+g.dataset.go); return}
  const a = e.target.closest("[data-act]"); if(!a) return;
  if(a.dataset.act==="first"){RV.filter="all"; viewItem(0)}
  else if(a.dataset.act==="wrong"){RV.filter="ng"; viewItem(filtered("ng")[0])}
  else if(a.dataset.act==="again") $("startBtn").click();
  else if(a.dataset.act==="summary") viewSummary();
});
$("rvMain").addEventListener("input", e=>{if(e.target.id==="rvMemo") saveMemo(RV.view, e.target.value)});
$("rvGrid").addEventListener("click", e=>{const c=e.target.closest("[data-go]"); if(c) viewItem(+c.dataset.go)});
$("rvFilters").addEventListener("click", e=>{
  const b = e.target.closest("[data-f]"); if(!b) return;
  RV.filter = b.dataset.f; renderReview();
});
$("rvSummaryBtn").addEventListener("click", viewSummary);
$("rvHomeBtn").addEventListener("click", home);
$("rvListBtn").addEventListener("click", ()=>document.body.classList.toggle("showgrid"));
document.addEventListener("keydown", e=>{
  if($("result").hidden || !$("confirm").hidden || e.ctrlKey || e.metaKey || e.altKey || RV.view==="summary") return;
  if(e.target.closest("textarea,input")) return;
  const list = filtered(RV.filter), i = RV.view;
  if(e.key==="ArrowRight"){const n = list.find(x=>x>i); if(n!==undefined) viewItem(n)}
  else if(e.key==="ArrowLeft"){const p = [...list].reverse().find(x=>x<i); if(p!==undefined) viewItem(p)}
});

