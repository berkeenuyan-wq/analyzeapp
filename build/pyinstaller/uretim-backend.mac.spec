# PyInstaller spec — one-file macOS build of the FastAPI sidecar.
#
#   cd <repo root>
#   backend/.venv/bin/pyinstaller build/pyinstaller/uretim-backend.mac.spec \
#     --noconfirm --distpath build/pyinstaller/dist --workpath build/pyinstaller/work
#
# Produces build/pyinstaller/dist/uretim-backend — a console binary that prints
# `UP_BACKEND_PORT=<n>` and serves the app. electron-builder bundles it as
# extraResources (see build/electron-builder.yml).
from PyInstaller.utils.hooks import collect_all, collect_submodules, copy_metadata

datas, binaries, hiddenimports = [], [], []

for _pkg in ("pandas", "numpy", "openpyxl", "uvicorn", "fastapi", "pydantic",
             "pydantic_core", "starlette", "anyio", "click", "h11"):
    try:
        d, b, h = collect_all(_pkg)
        datas += d
        binaries += b
        hiddenimports += h
    except Exception as exc:  # pragma: no cover
        print(f"[spec] skip {_pkg}: {exc}")

for _meta in ("pandas", "numpy", "openpyxl", "fastapi", "pydantic",
              "pydantic_core", "starlette", "uvicorn", "anyio", "packaging"):
    try:
        datas += copy_metadata(_meta)
    except Exception:
        pass

# The seed data ships inside the binary; config.BUNDLE_ROOT resolves to
# sys._MEIPASS when frozen, so data/seed/* lands at <MEIPASS>/data/seed/*.
datas += [("../../data/seed", "data/seed")]

# Our own package — analysed from run.py, but migrations are imported by name.
hiddenimports += collect_submodules("backend")
hiddenimports += [
    "backend.core.migrations._runner",
    "backend.core.migrations.0001_v2_tables",
    "pandas._libs.tslibs.base",
    "openpyxl.cell._writer",
    "uvicorn.logging",
    "uvicorn.loops.auto",
    "uvicorn.protocols.http.auto",
    "uvicorn.protocols.websockets.auto",
    "uvicorn.lifespan.on",
]

a = Analysis(
    ["../../backend/run.py"],
    pathex=["../.."],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=["tkinter", "matplotlib", "PyQt5", "PySide2", "IPython", "pytest",
              "streamlit", "plotly", "altair"],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="uretim-backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    runtime_tmpdir=None,
    console=True,
    target_arch=None,  # native arch of the build machine
    disable_windowed_traceback=False,
    icon=None,
)
