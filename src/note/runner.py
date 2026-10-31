import io, sys, ast, base64, contextlib, traceback, warnings

def _run(src):
    """Jupyter風に実行する: print出力 + 最後の式の値 + 描いたグラフ"""
    import os as _os
    try:
        _os.makedirs("/tmp/work", exist_ok=True)
        _os.chdir("/tmp/work")
    except Exception:
        pass
    try:
        import matplotlib
        matplotlib.use("agg")
    except Exception:
        pass
    import logging
    for _h in logging.root.handlers[:]:
        logging.root.removeHandler(_h)
    buf = io.StringIO()
    g = {"__name__": "__main__"}
    err = False
    html = None
    caught = []
    with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf), warnings.catch_warnings(record=True) as wl:
        warnings.simplefilter("always")
        try:
            tree = ast.parse(src)
            last = None
            if tree.body and isinstance(tree.body[-1], ast.Expr):
                last = ast.Expression(tree.body.pop().value)
            exec(compile(tree, "<code>", "exec"), g)
            if last is not None:
                v = eval(compile(last, "<code>", "eval"), g)
                if v is not None:
                    if type(v).__name__ == "DataFrame":
                        html = v.to_html(max_rows=20, max_cols=12)
                    else:
                        print(repr(v))
        except SystemExit:
            pass
        except SyntaxError as e:
            err = True
            buf.write(f"{e.lineno}行目: SyntaxError: {e.msg}\n")
        except BaseException as e:
            err = True
            ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename == "<code>"]
            where = f"{ln[-1]}行目: " if ln else ""
            buf.write(f"{where}{type(e).__name__}: {e}\n")
        for w in wl:
            msg = str(w.message)
            if "non-interactive" in msg or "non-GUI backend" in msg or "FigureCanvasAgg" in msg:
                continue
            if issubclass(w.category, (DeprecationWarning, PendingDeprecationWarning, ResourceWarning)):
                continue
            caught.append(f"{w.category.__name__}: {msg}")
    figs = []
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is not None:
        for n in plt.get_fignums():
            fig = plt.figure(n)
            b = io.BytesIO()
            fig.savefig(b, format="png", dpi=80, bbox_inches="tight")
            figs.append(base64.b64encode(b.getvalue()).decode())
        plt.close("all")
        try:
            import matplotlib as _mpl
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                _mpl.rcdefaults()
            _mpl.use("agg")
        except Exception:
            pass
    return [buf.getvalue(), err, html, figs, caught]
