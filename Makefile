CMD_ARGS = $(filter-out $@,$(MAKECMDGOALS))

%:
  @:

NPM_RELEASE_TAG ?= latest
ELECTRON_BUILDER_EXTRA_ARGS ?=

ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname)
endif

node_modules: yarn.lock
	yarn install --check-files --frozen-lockfile --network-timeout=100000

binaries/client: node_modules
	yarn download:binaries

.PHONY: compile-dev
compile-dev: node_modules
	yarn compile:main --cache
	yarn compile:renderer --cache

.PHONY: validate-dev
ci-validate-dev: binaries/client compile-dev

.PHONY: dev
dev: binaries/client
	rm -rf static/build/
	yarn run build:tray-icons
	yarn dev

.PHONY: lint
lint: node_modules
	yarn lint

.PHONY: tag-release
tag-release:
	scripts/tag-release.sh $(CMD_ARGS)

.PHONY: test
test: node_modules binaries/client
	yarn run jest $(or $(CMD_ARGS), "src")

.PHONY: integration
integration: build
	yarn integration

.PHONY: build
build: node_modules binaries/client
	yarn run build:tray-icons
	yarn run compile
ifeq "$(DETECTED_OS)" "Windows"
# https://github.com/ukoloff/win-ca#clear-pem-folder-on-publish
	rm -rf node_modules/win-ca/pem
endif
	yarn run electron-builder --publish onTag $(ELECTRON_BUILDER_EXTRA_ARGS)

src/extensions/npm/extensions/__mocks__:
	cp -r __mocks__ src/extensions/npm/extensions/

packages/extensions/dist: packages/extensions/node_modules
	yarn compile:extension-types

packages/extensions/node_modules: packages/extensions/package.json
	cd packages/extensions/ && ../../node_modules/.bin/npm install --no-audit --no-fund --no-save

.PHONY: build-extensions-npm
build-extensions-npm: build-extension-types packages/extensions/__mocks__
	yarn npm:fix-extensions-package-version

.PHONY: build-library-npm
build-library-npm:
	yarn compile-library

.PHONY: build-extension-types
build-extension-types: node_modules packages/extensions/dist

.PHONY: publish-extensions-npm
publish-extensions-npm: node_modules build-extensions-npm
	./node_modules/.bin/npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}"
	cd packages/extensions && npm publish --access=public --tag=$(NPM_RELEASE_TAG) && git restore package.json

.PHONY: publish-library-npm
publish-library-npm: node_modules build-library-npm
	./node_modules/.bin/npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}"
	npm publish --access=public --tag=$(NPM_RELEASE_TAG)

.PHONY: build-docs
build-docs:
	yarn typedocs-extensions-api

.PHONY: docs
docs: build-docs
	yarn mkdocs-serve-local

.PHONY: clean-npm
clean-npm:
	rm -rf packages/extensions/{dist,__mocks__,node_modules}
	rm -rf static/build/library/

.PHONY: clean
clean: clean-npm
	rm -rf binaries/client
	rm -rf dist
	rm -rf static/build
	rm -rf node_modules
	rm -rf site
	rm -rf docs/extensions/api
