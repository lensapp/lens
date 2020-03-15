ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname)
endif

.PHONY: dev build test clean

dev: app-deps dashboard-deps build-dashboard-server
	yarn dev

test: test-app test-dashboard

lint:
	yarn lint

test-app:
	yarn test

deps: app-deps dashboard-deps

app-deps:
	yarn install --frozen-lockfile

build: build-dashboard app-deps
	yarn install
ifeq "$(DETECTED_OS)" "Windows"
	yarn dist:win
else
	yarn dist
endif

dashboard-deps:
	cd dashboard && yarn install --frozen-lockfile

clean-dashboard:
	rm -rf dashboard/build/ && rm -rf static/build/client

test-dashboard: dashboard-deps
	cd dashboard && yarn test

build-dashboard: build-dashboard-server build-dashboard-client

build-dashboard-server: dashboard-deps clean-dashboard
	cd dashboard && yarn build-server
ifeq "$(DETECTED_OS)" "Linux"
	rm binaries/server/linux/lens-server || true
	cd dashboard && yarn pkg-server-linux
endif
ifeq "$(DETECTED_OS)" "Darwin"
	rm binaries/server/darwin/lens-server || true
	cd dashboard && yarn pkg-server-macos
endif
ifeq "$(DETECTED_OS)" "Windows"
	rm binaries/server/windows/*.exe || true
	cd dashboard && yarn pkg-server-win
endif

build-dashboard-client: dashboard-deps clean-dashboard
	cd dashboard && yarn build-client

clean:
	rm -rf dist/*
