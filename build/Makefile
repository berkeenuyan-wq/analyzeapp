# Packaging targets. Run from anywhere: `make -C build dmg`.
REPO := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)
PY := $(REPO)/backend/.venv/bin/python
PYINSTALLER := $(REPO)/backend/.venv/bin/pyinstaller

.PHONY: dmg backend-bin renderer electron-tsc clean

dmg: backend-bin renderer electron-tsc ## Build the macOS .dmg
	cd $(REPO)/electron && npx electron-builder --mac --config $(REPO)/build/electron-builder.yml
	@echo "→ $(REPO)/build/dist/"

backend-bin: ## One-file PyInstaller backend binary
	cd $(REPO) && $(PYINSTALLER) build/pyinstaller/uretim-backend.mac.spec --noconfirm \
	  --distpath build/pyinstaller/dist --workpath build/pyinstaller/work

renderer: ## Production frontend bundle
	cd $(REPO)/frontend && npm run build

electron-tsc: ## Compile the Electron main/preload/sidecar
	cd $(REPO)/electron && npm run build

clean:
	rm -rf $(REPO)/build/dist $(REPO)/build/pyinstaller/dist $(REPO)/build/pyinstaller/work
