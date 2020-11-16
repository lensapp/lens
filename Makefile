EXTENSIONS_DIR = ./extensions

ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname)
endif

.PHONY: init
init: install-deps download-bins compile-dev
	echo "Init done"

.PHONY: download-bins
download-bins:
	yarn download-bins

.PHONY: install-deps
install-deps:
	yarn install --frozen-lockfile --verbose
	yarn check --verify-tree --integrity

.PHONY: compile-dev
compile-dev:
	yarn compile:main --cache
	yarn compile:renderer --cache

.PHONY: dev
dev:
ifeq ("$(wildcard static/build/main.js)","")
	make init
endif
	yarn dev

.PHONY: lint
lint:
	yarn lint

.PHONY: test
test: download-bins
	yarn test

.PHONY: integration-linux
integration-linux: build-extension-types build-extensions
	yarn build:linux
	yarn integration

.PHONY: integration-mac
integration-mac: build-extension-types build-extensions
	yarn build:mac
	yarn integration

.PHONY: integration-win
integration-win: build-extension-types build-extensions
	yarn build:win
	yarn integration

.PHONY: test-app
test-app:
	yarn test

.PHONY: build
build: install-deps download-bins build-extensions
ifeq "$(DETECTED_OS)" "Windows"
	yarn dist:win
else
	yarn dist
endif

.PHONY: build-extensions
build-extensions:
	$(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), (cd $(dir) && npm install && npm run build || exit $?);)

.PHONY: test-extensions
test-extensions:
	$(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), (cd $(dir) && npm install --dev && npm run test || exit $?);)

.PHONY: copy-extension-themes
copy-extension-themes:
	mkdir -p src/extensions/npm/extensions/dist/src/renderer/themes/
	cp $(wildcard src/renderer/themes/*.json) src/extensions/npm/extensions/dist/src/renderer/themes/

src/extensions/npm/extensions/__mocks__:
	cp -r __mocks__ src/extensions/npm/extensions/

src/extensions/npm/extensions/dist:
	yarn compile:extension-types

.PHONY: build-npm
build-npm: build-extension-types copy-extension-themes src/extensions/npm/extensions/__mocks__
	yarn npm:fix-package-version

.PHONY: build-extension-types
build-extension-types: src/extensions/npm/extensions/dist

.PHONY: publish-npm
publish-npm: build-npm
	npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}"
	cd src/extensions/npm/extensions && npm publish --access=public

.PHONY: clean-npm
clean-npm:
ifeq "$(DETECTED_OS)" "Windows"
	if exist src\extensions\npm\extensions\dist del /s /q src\extensions\npm\extensions\dist
	if exist src\extensions\npm\extensions\__mocks__ del /s /q src\extensions\npm\extensions\__mocks__
	if exist src\extensions\npm\extensions\node_modules del /s /q src\extensions\npm\extensions\node_modules
else
	rm -rf src/extensions/npm/extensions/dist
	rm -rf src/extensions/npm/extensions/__mocks__
	rm -rf src/extensions/npm/extensions/node_modules
endif

.PHONY: clean
clean: clean-npm
ifeq "$(DETECTED_OS)" "Windows"
	if exist binaries\client del /s /q binaries\client\*.*
	if exist dist del /s /q dist\*.*
	if exist static\build del /s /q static\build\*.*
else
	rm -rf binaries/client/*
	rm -rf dist/*
	rm -rf static/build/*
endif
