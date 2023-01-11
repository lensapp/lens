CMD_ARGS = $(filter-out $@,$(MAKECMDGOALS))

%:
  @:

ELECTRON_BUILDER_EXTRA_ARGS ?=

ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname)
endif

node_modules: yarn.lock
	yarn install --check-files --frozen-lockfile --network-timeout=100000
	yarn lerna bootstrap

.PHONY: lint
lint: node_modules
	yarn lint

.PHONY: test
test: node_modules
	yarn run test:unit

.PHONY: integration
integration: build
	yarn test:integration

.PHONY: build
build:
	yarn run build
ifeq "$(DETECTED_OS)" "Windows"
# https://github.com/ukoloff/win-ca#clear-pem-folder-on-publish
	rm -rf packages/core/node_modules/win-ca/pem
endif
	yarn lerna run build:app --publish onTag $(ELECTRON_BUILDER_EXTRA_ARGS)


.PHONY: clean
clean:
	yarn run clean
	yarn run clean:node_modules
