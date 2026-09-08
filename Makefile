# Üretim Paneli v2 — dev entry points. See docs/DEV.md.
.DEFAULT_GOAL := help
SHELL := /bin/bash

PY := backend/.venv/bin/python
VENV := backend/.venv

.PHONY: help setup dev-backend dev-frontend dev-electron \
        test test-backend test-frontend lint typecheck smoke clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

setup: ## Create the backend venv + install all deps (backend, frontend, electron)
	python3.12 -m venv $(VENV) 2>/dev/null || python3 -m venv $(VENV)
	$(PY) -m pip install -q --upgrade pip
	$(PY) -m pip install -q -r backend/requirements-dev.txt
	cd frontend && npm install
	cd electron && npm install

dev-backend: ## Run the FastAPI sidecar on :8000 (browser dev)
	UP_BACKEND_PORT=8000 $(PY) -m backend.run

dev-frontend: ## Run the Vite dev server on :5173
	cd frontend && npm run dev

dev-electron: ## Build + launch the Electron shell (needs dev-frontend running)
	cd electron && npm run start

test: test-backend test-frontend ## Run every test suite

test-backend: ## pytest (incl. the metric baseline)
	$(PY) -m pytest backend/tests -q

test-frontend: ## vitest
	cd frontend && npm run test

smoke: ## Headless Electron sidecar lifecycle / no-orphan check
	cd electron && npm run smoke

lint: ## ruff + eslint (frontend + electron)
	backend/.venv/bin/ruff check backend
	cd frontend && npm run lint
	cd electron && npm run lint

typecheck: ## mypy + tsc (frontend + electron)
	backend/.venv/bin/mypy
	cd frontend && npm run typecheck
	cd electron && npm run typecheck

clean: ## Remove build output (keeps venv + node_modules)
	rm -rf frontend/dist electron/dist build/pyinstaller/dist build/pyinstaller/work
