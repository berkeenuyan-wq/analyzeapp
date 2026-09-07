# PyInstaller spec — one-file Windows build of the Üretim Paneli dashboard.
# Build:  python -m PyInstaller UretimPaneli.spec --noconfirm
from PyInstaller.utils.hooks import collect_all, copy_metadata

datas, binaries, hiddenimports = [], [], []

# Third-party packages that src/* imports (PyInstaller can't see them because the
# app is shipped as data files, not analysed as code).
for _pkg in ("streamlit", "plotly", "pandas", "numpy", "openpyxl", "pyarrow",
             "altair", "pydeck", "tornado", "watchdog"):
    try:
        d, b, h = collect_all(_pkg)
        datas += d
        binaries += b
        hiddenimports += h
    except Exception as exc:  # pragma: no cover - optional deps
        print(f"[spec] skip {_pkg}: {exc}")

for _meta in ("streamlit", "pandas", "numpy", "plotly", "openpyxl", "pyarrow",
              "altair", "packaging", "importlib_metadata", "gitpython", "rich",
              "click", "blinker", "cachetools", "tenacity", "toml", "narwhals"):
    try:
        datas += copy_metadata(_meta)
    except Exception:
        pass

# The application itself, shipped verbatim so Streamlit can `run` app.py.
datas += [
    ("app.py", "."),
    ("src", "src"),
    ("assets", "assets"),
    ("data/seed", "data/seed"),
    (".streamlit", ".streamlit"),
]

hiddenimports += [
    "src", "src.config", "src.db", "src.metrics", "src.charts", "src.theme",
    "src.icons", "src.fmt", "src.ui", "src.ingest", "src.excel_io",
    "src.sections", "src.sections._common", "src.sections.genel_bakis",
    "src.sections.pres_performansi", "src.sections.posa_analizi",
    "src.sections.arac_lojistigi", "src.sections.kpi_panel", "src.data_panel",
    "pandas._libs.tslibs.base", "openpyxl.cell._writer",
]

a = Analysis(
    ["launcher.py"],
    pathex=["."],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=["tkinter", "matplotlib", "PyQt5", "PySide2", "IPython", "pytest"],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="UretimPaneli",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    icon=None,
)
