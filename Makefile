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

build: install-deps download-bins build-extensions
ifeq "$(DETECTED_OS)" "Windows"
	yarn dist:win
else
	yarn dist
endif

build-extensions:
	$(foreach file, $(wildcard $(EXTENSIONS_DIR)/*), $(MAKE) -C $(file) build;)

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
