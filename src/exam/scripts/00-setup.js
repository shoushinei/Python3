const EXAM = __EXAM__;
const Q = __QUESTIONS__;
const CHN = EXAM.chapters;
const N = Q.length, LIMIT = EXAM.limitMinutes*60*1000, PASS = EXAM.passScore, NOTE = EXAM.noteHref, LS = EXAM.storagePrefix;
const L = "ABCDE";
const $ = id => document.getElementById(id);
function lsGet(k, d){try{const v = localStorage.getItem(LS+k); return v ? JSON.parse(v) : d}catch(e){return d}}
function lsSet(k, v){try{localStorage.setItem(LS+k, JSON.stringify(v)); return true}catch(e){return false}}
function lsDel(k){try{localStorage.removeItem(LS+k)}catch(e){}}

let S = null, tick = null;

function shuffle(n){const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function fmtTime(ms){ms=Math.max(0,ms);const s=Math.ceil(ms/1000);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function fmtDate(t){const d=new Date(t);return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`}
function show(id){for(const s of ["home","exam","result"])$(s).hidden = s!==id; document.body.classList.remove("showgrid"); window.scrollTo(0,0)}

/* ---------- 受験記録 ---------- */
/* 記録は { start, end, used, timeout, correct, score, flag, memo } に加えて、
   受験した回は ans（選んだ答え）と perm（選択肢の並び）、手で入力した回は marks（1=○ 0=× null=未回答）を持つ。 */
function statusOf(r, i){
  const v = r.marks ? r.marks[i] : (r.ans[i]===null ? null : +(r.ans[i]===Q[i].ans));
  return v===null ? "un" : v ? "ok" : "ng";
}
function withScore(r){
  r.correct = Q.reduce((s,q,i)=>s+(statusOf(r,i)==="ok"?1:0), 0);
  r.score = Math.round(r.correct/N*1000);
  return r;
}
function recKey(r){return [r.start, r.end, JSON.stringify(r.marks||r.ans)].join("|")}
function loadHist(){return lsGet("hist", []).sort((a,b)=>a.end-b.end)}
function saveHist(H){return lsSet("hist", H)}

