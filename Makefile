CMD_ARGS = $(filter-out $@,$(MAKECMDGOALS))

%:
  @:

ELECTRON_BUILDER_EXTRA_ARGS ?=

.PHONY: bootstrap
bootstrap:
	yarn install

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
	yarn lerna run build:app

.PHONY: clean
clean:
	yarn run clean
	yarn run clean:node_modules
