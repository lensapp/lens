CMD_ARGS = $(filter-out $@,$(MAKECMDGOALS))

%:
  @:

EXTENSIONS_DIR = ./extensions
extensions = $(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), ${dir})
extension_node_modules = $(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), ${dir}/node_modules)
extension_dists = $(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), ${dir}/dist)

ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname)
endif

binaries/client: node_modules
	yarn download-bins

node_modules: yarn.lock
	yarn install --frozen-lockfile --network-timeout=100000
	yarn check --verify-tree --integrity

static/build/LensDev.html: node_modules
	yarn compile:renderer

.PHONY: compile-dev
compile-dev: node_modules
	yarn compile:main --cache
	yarn compile:renderer --cache

.PHONY: dev
dev: binaries/client build-extensions static/build/LensDev.html
	yarn dev

.PHONY: lint
lint:
	yarn lint

.PHONY: test
test: binaries/client
	yarn run jest $(or $(CMD_ARGS), "src")

.PHONY: integration-linux
integration-linux: binaries/client build-extension-types build-extensions
# ifdef XDF_CONFIG_HOME
# 	rm -rf ${XDG_CONFIG_HOME}/.config/Lens
# else
# 	rm -rf ${HOME}/.config/Lens
# endif
	yarn build:linux
	yarn integration

.PHONY: integration-mac
integration-mac: binaries/client build-extension-types build-extensions
	# rm ${HOME}/Library/Application\ Support/Lens
	yarn build:mac
	yarn integration

.PHONY: integration-win
integration-win: binaries/client build-extension-types build-extensions
	# rm %APPDATA%/Lens
	yarn build:win
	yarn integration

.PHONY: build
build: node_modules binaries/client build-extensions
ifeq "$(DETECTED_OS)" "Windows"
	yarn dist:win
else
	yarn dist
endif

$(extension_node_modules):
	cd $(@:/node_modules=) && npm install --no-audit --no-fund

$(extension_dists): src/extensions/npm/extensions/dist
	cd $(@:/dist=) && npm run build

.PHONY: build-extensions
build-extensions: node_modules $(extension_node_modules) $(extension_dists)

.PHONY: test-extensions
test-extensions: $(extension_node_modules)
	$(foreach dir, $(extensions), (cd $(dir) && npm run test || exit $?);)

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

.PHONY: docs
docs:
	yarn mkdocs-serve-local

.PHONY: clean-extensions
clean-extensions:
	$(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), rm -rf $(dir)/dist)
	$(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), rm -rf $(dir)/node_modules)

.PHONY: clean-npm
clean-npm:
	rm -rf src/extensions/npm/extensions/dist
	rm -rf src/extensions/npm/extensions/__mocks__
	rm -rf src/extensions/npm/extensions/node_modules

.PHONY: clean
clean: clean-npm clean-extensions
	rm -rf binaries/client
	rm -rf dist/*
	rm -rf static/build/*
	rm -rf node_modules/
