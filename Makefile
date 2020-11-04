EXTENSIONS_DIR = ./extensions

ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname)
endif

.PHONY: init dev build test clean

init: install-deps download-bins compile-dev
	echo "Init done"

download-bins:
	yarn download-bins

install-deps:
	yarn install --frozen-lockfile

compile-dev:
	yarn compile:main --cache
	yarn compile:renderer --cache

dev:
ifeq ("$(wildcard static/build/main.js)","")
	make init
endif
	yarn dev

lint:
	yarn lint

test: download-bins
	yarn test

integration-linux: build-extension-types build-extensions
	yarn build:linux
	yarn integration

integration-mac: build-extension-types build-extensions
	yarn build:mac
	yarn integration

integration-win: build-extension-types build-extensions
	yarn build:win
	yarn integration

test-app:
	yarn test

build: install-deps download-bins build-extensions
ifeq "$(DETECTED_OS)" "Windows"
	yarn dist:win
else
	yarn dist
endif

build-extensions:
	$(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), $(MAKE) -C $(dir) build;)

test-extensions:
	$(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), $(MAKE) -C $(dir) test;)

build-npm: build-extension-types
	yarn npm:fix-package-version

build-extension-types:
	yarn compile:extension-types

publish-npm: build-npm
	npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}"
	cd src/extensions/npm/extensions && npm publish --access=public

clean:
ifeq "$(DETECTED_OS)" "Windows"
	if exist binaries\client del /s /q binaries\client\*.*
	if exist dist del /s /q dist\*.*
	if exist static\build del /s /q static\build\*.*
else
	rm -rf binaries/client/*
	rm -rf dist/*
	rm -rf static/build/*
endif
