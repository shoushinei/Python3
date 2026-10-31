/* ---------- 記録の書き出しと読み込み ---------- */
const FORMAT = "python-exam-records";
function setRecMsg(text, bad){const m = $("recMsg"); m.textContent = text; m.classList.toggle("bad", !!bad)}

$("exportBtn").addEventListener("click", ()=>{
  const H = loadHist();
  const data = {format:FORMAT, version:1, exam:EXAM.id, questions:N, exportedAt:new Date().toISOString(), records:H};
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], {type:"application/json"}));
  const d = new Date(), stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const a = document.createElement("a");
  a.href = url; a.download = `python-${EXAM.id}-exam-records-${stamp}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
  setRecMsg(`${H.length} 回分の記録を書き出しました。別の端末の「記録を読み込む」で取り込めます。`);
});

$("importBtn").addEventListener("click", ()=>$("importFile").click());
$("importFile").addEventListener("change", async e=>{
  const file = e.target.files[0]; e.target.value = "";
  if(!file) return;
  try{
    setRecMsg(importRecords(JSON.parse(await file.text())));
  }catch(err){
    setRecMsg(err instanceof SyntaxError ? "読み込めませんでした。JSON ファイルではないようです。" : err.message, true);
  }
});

/** ファイルの中身を確かめて今の記録に足し、結果の文を返す。 */
function importRecords(data){
  if(!data || data.format!==FORMAT || !Array.isArray(data.records)) throw new Error("読み込めませんでした。この模試の「記録を書き出す」で作ったファイルではありません。");
  if(data.exam!==EXAM.id) throw new Error("読み込めませんでした。別の試験の記録です。");
  const H = loadHist(), keys = new Map(H.map(r=>[recKey(r),r]));
  let added = 0, same = 0, bad = 0;
  for(const raw of data.records){
    const r = cleanRecord(raw);
    if(!r){bad++; continue}
    const old = keys.get(recKey(r));
    if(old){same++; mergeMemo(old, r); continue}
    keys.set(recKey(r), r); H.push(r); added++;
  }
  H.sort((a,b)=>a.end-b.end);
  if(!saveHist(H)) throw new Error("保存できませんでした。ブラウザの保存領域を確認してください。");
  home();
  const parts = [added ? `${added} 回分の記録を追加しました。` : "追加する記録はありませんでした。"];
  if(same) parts.push(`${same} 回分はすでにある記録なので、振り返りメモだけ合わせました。`);
  if(bad) parts.push(`${bad} 回分は内容が正しくないため、読み込みませんでした。`);
  return parts.join("");
}
/** ファイルの値をそのまま信用せず、必要な項目だけを確かめて記録に作り直す。 */
function cleanRecord(x){
  if(!x || typeof x!=="object" || !Number.isFinite(x.start) || !Number.isFinite(x.end)) return null;
  const r = {start:x.start, end:x.end, used:Number.isFinite(x.used)&&x.used>=0 ? x.used : null, timeout:x.timeout===true,
    flag:Q.map((_,i)=>Array.isArray(x.flag) && x.flag[i]===true), memo:{}};
  if(x.memo && typeof x.memo==="object") Q.forEach((_,i)=>{if(typeof x.memo[i]==="string" && x.memo[i].trim()) r.memo[i]=x.memo[i]});
  if(Array.isArray(x.marks)){
    if(x.marks.length!==N || !x.marks.every(v=>v===0||v===1||v===null)) return null;
    r.marks = x.marks;
  }else{
    if(!Array.isArray(x.ans) || !Array.isArray(x.perm) || x.ans.length!==N || x.perm.length!==N) return null;
    const okAns = x.ans.every((a,i)=>a===null || (Number.isInteger(a) && a>=0 && a<Q[i].opts.length));
    const okPerm = x.perm.every((p,i)=>Array.isArray(p) && p.length===Q[i].opts.length && [...p].sort((a,b)=>a-b).every((v,k)=>v===k));
    if(!okAns || !okPerm) return null;
    r.ans = x.ans; r.perm = x.perm;
  }
  return withScore(r);
}
/** 同じ回のメモが端末ごとに違うときは、どちらも消さずにつなげる。 */
function mergeMemo(old, r){
  old.memo = old.memo || {};
  for(const [i,text] of Object.entries(r.memo)){
    const cur = old.memo[i];
    if(!cur || cur.includes(text)) old.memo[i] = cur || text;
    else if(text.includes(cur)) old.memo[i] = text;
    else old.memo[i] = cur+"\n\n"+text;
  }
}

