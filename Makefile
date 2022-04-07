CMD_ARGS = $(filter-out $@,$(MAKECMDGOALS))

%:
  @:

NPM_RELEASE_TAG ?= latest
ELECTRON_BUILDER_EXTRA_ARGS ?=
EXTENSIONS_DIR = ./extensions
extensions = $(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), ${dir})
extension_node_modules = $(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), ${dir}/node_modules)
extension_dists = $(foreach dir, $(wildcard $(EXTENSIONS_DIR)/*), ${dir}/dist)

ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname)
endif

node_modules: yarn.lock
	yarn install --frozen-lockfile --network-timeout=100000
	yarn check --verify-tree --integrity

binaries/client: node_modules
	yarn download:binaries

.PHONY: compile-dev
compile-dev: node_modules
	yarn compile:main --cache
	yarn compile:renderer --cache

.PHONY: validate-dev
ci-validate-dev: binaries/client build-extensions compile-dev

.PHONY: dev
dev: binaries/client build-extensions
	rm -rf static/build/
	yarn dev

.PHONY: lint
lint: node_modules
	yarn lint

.PHONY: tag-release
tag-release:
	scripts/tag-release.sh $(CMD_ARGS)

.PHONY: test
test: binaries/client
	yarn run jest $(or $(CMD_ARGS), "src")

.PHONY: integration
integration: build
	yarn integration

.PHONY: build
build: node_modules binaries/client
	yarn run npm:fix-build-version
	$(MAKE) build-extensions -B
	yarn run compile
ifeq "$(DETECTED_OS)" "Windows"
# https://github.com/ukoloff/win-ca#clear-pem-folder-on-publish
	rm -rf node_modules/win-ca/pem
endif
	yarn run electron-builder --publish onTag $(ELECTRON_BUILDER_EXTRA_ARGS)

.NOTPARALLEL: $(extension_node_modules)
$(extension_node_modules): node_modules
	cd $(@:/node_modules=) && ../../node_modules/.bin/npm install --no-audit --no-fund --no-save

$(extension_dists): src/extensions/npm/extensions/dist $(extension_node_modules)
	cd $(@:/dist=) && ../../node_modules/.bin/npm run build

.PHONY: clean-old-extensions
clean-old-extensions:
	find ./extensions -mindepth 1 -maxdepth 1 -type d '!' -exec test -e '{}/package.json' \; -exec rm -rf {} \;

.PHONY: build-extensions
build-extensions: node_modules clean-old-extensions $(extension_dists)

.PHONY: test-extensions
test-extensions: $(extension_node_modules)
	$(foreach dir, $(extensions), (cd $(dir) && npm run test || exit $?);)

src/extensions/npm/extensions/__mocks__:
	cp -r __mocks__ src/extensions/npm/extensions/

src/extensions/npm/extensions/dist: node_modules
	yarn compile:extension-types

.PHONY: build-npm
build-npm: build-extension-types src/extensions/npm/extensions/__mocks__
	yarn npm:fix-package-version

.PHONY: build-extension-types
build-extension-types: node_modules src/extensions/npm/extensions/dist

.PHONY: publish-npm
publish-npm: node_modules build-npm
	./node_modules/.bin/npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}"
	cd src/extensions/npm/extensions && npm publish --access=public --tag=$(NPM_RELEASE_TAG)
	git restore src/extensions/npm/extensions/package.json

.PHONY: build-docs
build-docs:
	yarn typedocs-extensions-api

.PHONY: docs
docs: build-docs
	yarn mkdocs-serve-local

.PHONY: clean-extensions
clean-extensions:
	rm -rf $(EXTENSIONS_DIR)/*/{dist,node_modules,*.tgz}

.PHONY: clean-npm
clean-npm:
	rm -rf src/extensions/npm/extensions/{dist,__mocks__,node_modules}

.PHONY: clean
clean: clean-npm clean-extensions
	rm -rf binaries/client
	rm -rf dist
	rm -rf static/build
	rm -rf node_modules
	rm -rf site
	rm -rf docs/extensions/api
