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

node_modules: package-lock.json
	npm clean-install

binaries/client: node_modules
	npm run download:binaries

.PHONY: compile-dev
compile-dev: node_modules
	npm run compile:main -- --cache
	npm run compile:renderer -- --cache

.PHONY: validate-dev
ci-validate-dev: binaries/client compile-dev

.PHONY: dev
dev: binaries/client
	rm -rf static/build/
	npm run build:tray-icons
	npm run dev

.PHONY: lint
lint: node_modules
	npm run lint

.PHONY: tag-release
tag-release:
	scripts/tag-release.sh $(CMD_ARGS)

.PHONY: test
test: node_modules binaries/client
	npm exec -- jest $(or $(CMD_ARGS), "src")

.PHONY: integration
integration: build
	npm run integration

.PHONY: build-impl
build-impl:
	npm run download:binaries
	npm run build:tray-icons
	npm run compile
ifeq "$(DETECTED_OS)" "Windows"
# https://github.com/ukoloff/win-ca#clear-pem-folder-on-publish
	rm -rf node_modules/win-ca/pem
endif
	npm exec -- electron-builder --publish onTag $(ELECTRON_BUILDER_EXTRA_ARGS)

.PHONY: build
build: node_modules binaries/client build-impl

src/extensions/npm/extensions/__mocks__:
	cp -r __mocks__ src/extensions/npm/extensions/

packages/extensions/dist: packages/extensions/node_modules
	npm run compile:extension-types

packages/extensions/node_modules: packages/extensions/package.json
	cd packages/extensions/ && ../../node_modules/.bin/npm install --no-audit --no-fund --no-save

.PHONY: build-extensions-npm
build-extensions-npm: build-extension-types packages/extensions/__mocks__
	npm run npm:fix-extensions-package-version

.PHONY: build-library-npm
build-library-npm:
	npm run compile-library

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
	npm run typedocs-extensions-api

.PHONY: docs
docs: build-docs
	npm run mkdocs-serve-local

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
