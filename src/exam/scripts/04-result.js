/* ---------- 採点 ---------- */
function finish(timeout){
  clearInterval(tick);
  const end = Math.min(Date.now(), S.deadline);
  const correct = Q.reduce((s,q,i)=>s+(S.ans[i]===q.ans?1:0), 0);
  const rec = {start:S.start, end, used:end-S.start, timeout, correct, score:Math.round(correct/N*1000), ans:S.ans, perm:S.perm, flag:S.flag};
  const H = lsGet("hist", []); H.push(rec); lsSet("hist", H.slice(-30));
  lsDel("cur"); S = null;
  result(rec);
}

function result(r){
  show("result");
  const pass = r.score >= PASS;
  const by = {};
  Q.forEach((q,i)=>{(by[q.ch] ||= {n:0,c:0}).n++; if(r.ans[i]===q.ans) by[q.ch].c++});
  let h = `<div class="report">
    <div class="eyebrow">SCORE REPORT · ${fmtDate(r.end)}</div>
    <div class="scorebox">
      <div class="score"><b>${r.score}</b><span> / 1000</span></div>
      <div class="verdict ${pass?"pass":"fail"}">${pass?"合格":"不合格"}</div>
    </div>
    <div class="meterline"><i style="width:${r.score/10}%"></i><em></em></div>
    <div class="meterlbl"><span>合格 ${PASS}</span></div>
    <p class="meta">正答数 <b>${r.correct}</b> / ${N}　所要時間 <b>${fmtTime(r.used)}</b>${r.timeout?"（時間切れ）":""}${pass?"":`　合格まであと <b>${Math.max(0,Math.ceil(PASS*N/1000)-r.correct)}</b> 問`}</p>
    <div class="secan"><h3>セクション分析</h3>
    <table><tr><th>章</th><th>問題数</th><th style="width:44%">正解率</th></tr>`;
  Object.keys(CHN).sort((a,b)=>a-b).forEach(c=>{
    const v = by[c], pct = Math.round(v.c/v.n*100);
    h += `<tr><td>${c}. ${CHN[c]}</td><td class="n">${v.c} / ${v.n}</td><td><div class="bar"><span class="tr"><i class="${pct>=70?"":pct>=50?"mid":"low"}" style="width:${pct}%"></i></span><b>${pct}%</b></div></td></tr>`;
  });
  h += `</table></div>
    <div class="r-acts"><button class="btn primary" type="button" id="againBtn">もう一度受験する</button><button class="btn" type="button" id="homeBtn">模試のトップへ戻る</button></div>
  </div>
  <section class="rv"><h2>解答と解説</h2>
    <div class="filters" role="group" aria-label="表示する問題">
      <button type="button" data-f="all" aria-pressed="false">すべて</button>
      <button type="button" data-f="ng" aria-pressed="true">不正解のみ</button>
      <button type="button" data-f="fl" aria-pressed="false">見直しマーク</button>
    </div>
    <div id="rvList"></div>
  </section>`;
  $("result").innerHTML = h;
  $("againBtn").onclick = start;
  $("homeBtn").onclick = home;
  const list = f=>{
    let x = "";
    Q.forEach((q,i)=>{
      const ok = r.ans[i]===q.ans;
      if(f==="ng" && ok) return;
      if(f==="fl" && !r.flag[i]) return;
      x += `<article class="ritem${ok?"":" ng"}"><div class="rh"><span class="qno">問題 ${i+1}</span>
        <span class="mark ${ok?"ok":"ng"}">${ok?"正解":r.ans[i]===null?"未回答":"不正解"}</span>${r.flag[i]?'<span class="mark fl">見直し</span>':""}
        <span>第${q.ch}章 ${CHN[q.ch]}・${q.opts.length}択</span></div>
        <div class="qtext">${q.q}</div>${q.code?`<pre><code>${q.code}</code></pre>`:""}<ul class="optlist">`;
      r.perm[i].forEach((o,k)=>{
        const [t,mono] = q.opts[o];
        const cls = o===q.ans ? " right" : (o===r.ans[i] ? " wrong" : "");
        x += `<li><div class="opt${cls}"><span class="l">${L[k]}</span><span class="t${mono?" mono":""}">${t}</span>${o===r.ans[i]?'<span class="you">あなたの回答</span>':""}</div></li>`;
      });
      x += `</ul><div class="exp"><span class="eh">解説</span>${q.exp}<br><a href="${NOTE}#${q.sec}" target="_blank" rel="noopener">教材 ${q.secLabel} で復習する →</a></div></article>`;
    });
    $("rvList").innerHTML = x || '<p class="empty">該当する問題はありません。</p>';
  };
  list("ng");
  $("result").querySelector(".filters").addEventListener("click", e=>{
    const b = e.target.closest("[data-f]"); if(!b) return;
    $("result").querySelectorAll(".filters button").forEach(x=>x.setAttribute("aria-pressed", x===b));
    list(b.dataset.f);
  });
}

home();
