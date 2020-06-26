ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname)
endif

.PHONY: dev build test clean

download-bins:
	yarn download-bins

compile-dev:
	yarn compile:main --cache
	yarn compile:renderer --cache

dev: install-deps compile-dev
	yarn dev # run electron and watch files

lint:
	yarn lint

test:
	yarn test

integration-linux:
	yarn build:linux
	yarn integration

integration-mac:
	yarn build:mac
	yarn integration

integration-win:
	yarn build:win
	yarn integration

test-app:
	yarn test

install-deps:
	yarn install --frozen-lockfile

build: install-deps
	yarn install
ifeq "$(DETECTED_OS)" "Windows"
	yarn dist:win
else
	yarn dist
endif

clean:
	rm -rf binaries/client/*
	rm -rf dist/*
	rm -rf out/*
