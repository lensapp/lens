ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname)
endif

.PHONY: dev build test clean

download-bins:
	yarn download:bins

dev: app-deps dashboard-deps
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

build-dashboard: dashboard-deps clean-dashboard
	export NODE_ENV=production
	cd dashboard && yarn build

clean:
	rm -rf dist/*
