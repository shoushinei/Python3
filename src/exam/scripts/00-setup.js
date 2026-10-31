const EXAM = __EXAM__;
const Q = __QUESTIONS__;
const CHN = EXAM.chapters;
const N = Q.length, LIMIT = EXAM.limitMinutes*60*1000, PASS = EXAM.passScore, NOTE = EXAM.noteHref, LS = EXAM.storagePrefix;
const L = "ABCDE";
const $ = id => document.getElementById(id);
function lsGet(k, d){try{const v = localStorage.getItem(LS+k); return v ? JSON.parse(v) : d}catch(e){return d}}
function lsSet(k, v){try{localStorage.setItem(LS+k, JSON.stringify(v))}catch(e){}}
function lsDel(k){try{localStorage.removeItem(LS+k)}catch(e){}}

let S = null, tick = null;

function shuffle(n){const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function fmtTime(ms){ms=Math.max(0,ms);const s=Math.ceil(ms/1000);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function fmtDate(t){const d=new Date(t);return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`}
function show(id){for(const s of ["home","exam","result"])$(s).hidden = s!==id; window.scrollTo(0,0)}

