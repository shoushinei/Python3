  /* ---------- Python 実行（Pyodide） ---------- */
  const PY_URL="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  const RUNNER=__RUNNER__;
  let pyReady=null;
  function loadPy(){
    if(pyReady)return pyReady;
    pyReady=new Promise((res,rej)=>{
      const sc=document.createElement("script");
      sc.src=PY_URL+"pyodide.js";
      sc.onload=()=>loadPyodide({indexURL:PY_URL}).then(py=>{py.runPython(RUNNER);res(py)}).catch(rej);
      sc.onerror=()=>rej(new Error("load failed"));
      document.head.appendChild(sc);
    });
    pyReady.catch(()=>{pyReady=null});
    return pyReady;
  }
  document.querySelectorAll("pre.py").forEach(pre=>{
    const code=pre.querySelector("code");if(!code)return;
    pre.dataset.run="1";
    try{code.contentEditable="plaintext-only"}catch(e){code.contentEditable="true"}
    if(code.contentEditable!=="plaintext-only")code.contentEditable="true";
    code.spellcheck=false;
    const orig=code.innerHTML;
    const bar=document.createElement("div");bar.className="runbar";
    bar.innerHTML='<button type="button" class="run">▶ 実行</button><button type="button" class="undo" hidden>元に戻す</button><span class="st"></span>';
    const wrap=document.createElement("div");wrap.className="runwrap";wrap.hidden=true;
    wrap.innerHTML='<pre class="run-out"></pre><div class="run-df"></div><div class="runfig"></div>';
    const out=wrap.children[0],dfo=wrap.children[1],fo=wrap.children[2];
    pre.after(bar);bar.after(wrap);
    const st=bar.querySelector(".st"),undo=bar.querySelector(".undo");
    code.addEventListener("input",()=>{undo.hidden=false});
    code.addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();document.execCommand("insertText",false,"    ")}});
    undo.addEventListener("click",()=>{code.innerHTML=orig;undo.hidden=true;wrap.hidden=true});
    bar.querySelector(".run").addEventListener("click",async()=>{
      const src=code.innerText.replace(/ /g," ");
      st.textContent=pyReady?"実行中…":"Pythonを準備しています（初回のみ10〜20秒）…";
      try{
        const py=await loadPy();
        if(/\bsklearn\b/.test(src))st.textContent="scikit-learnを読み込んでいます（初回のみ30秒ほど）…";
        else st.textContent="実行中…";
        try{await py.loadPackagesFromImports(src)}catch(e){}
        if(/read_excel|to_excel/.test(src))await py.loadPackage("openpyxl").catch(()=>{});
        if(/read_html/.test(src))await py.loadPackage(["lxml","html5lib","beautifulsoup4"]).catch(()=>{});
        const fn=py.globals.get("_run");
        const r=fn(src);
        const [text,err,html,figs,warns]=r.toJs();r.destroy();fn.destroy();
        let t=(warns&&warns.length?warns.join("\n")+"\n":"")+(text||"");
        out.textContent=t||((html||figs.length)?"":"（表示される結果はありません）");
        out.hidden=!out.textContent;out.classList.toggle("err",!!err);
        dfo.innerHTML=html||"";dfo.hidden=!html;
        fo.innerHTML=figs.map(b=>'<img alt="実行したグラフ" src="data:image/png;base64,'+b+'">').join("");fo.hidden=!figs.length;
        wrap.hidden=false;
        st.textContent=(err&&/ModuleNotFoundError: No module named '(numpy|pandas|matplotlib|sklearn|scipy)/.test(text))?"ライブラリを読み込めませんでした。インターネット接続を確認して、もう一度押してください。":"";
      }catch(e){
        st.textContent="Pythonを読み込めませんでした。インターネット接続を確認して、もう一度押してください。";
      }
    });
  });

