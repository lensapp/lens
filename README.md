# Lens | The Kubernetes IDE

[![Build Status](https://dev.azure.com/lensapp/lensapp/_apis/build/status/lensapp.lens?branchName=master)](https://dev.azure.com/lensapp/lensapp/_build/latest?definitionId=1&branchName=master)
[![Releases](https://img.shields.io/github/downloads/lensapp/lens/total.svg)](https://github.com/lensapp/lens/releases)
[![Chat on Slack](https://img.shields.io/badge/chat-on%20slack-blue.svg?logo=slack&longCache=true&style=flat)](https://join.slack.com/t/k8slens/shared_invite/enQtOTc5NjAyNjYyOTk4LWU1NDQ0ZGFkOWJkNTRhYTc2YjVmZDdkM2FkNGM5MjhiYTRhMDU2NDQ1MzIyMDA4ZGZlNmExOTc0N2JmY2M3ZGI)

World’s most popular Kubernetes IDE provides a simplified, consistent entry point for developers, testers, integrators, and DevOps, to ship code faster at scale.  Lens is the only IDE you’ll ever need to take control of your Kubernetes clusters. It is a standalone application for MacOS, Windows and Linux operating systems.  Lens is an open source project and free!

[![Screenshot](.github/screenshot.png)](https://youtu.be/04v2ODsmtIs)

## What makes Lens special?

* Amazing usability and end-user experience
* Unified, secure, multi-cluster management on any platform: support for hundreds of clusters
* Standalone application: no need to install anything in-cluster
* Lens installs anywhere, elimanting the need to wrangle credentials
* Real-time cluster state visualization
* Resource utilization charts and trends with history powered by built-in Prometheus
* Smart terminal access to nodes and containers
* Clusters can be local (e.g. minikube) or external (e.g. EKS, GKE, AKS)
* Performance optimized to handle massive clusters (tested with a cluster running 25k pods)
* RBAC security is preserved, as Lens uses the standard Kubernetes API
* Lens Extensions are used to add custom visualizations and functionality to accelerate development workflows for all the technologies and services that integrate with Kubernetes
* Helm package deployment: Browse and deploy Helm charts with one click-Install

## Installation

Download a pre-built package from the [releases](https://github.com/lensapp/lens/releases) page. Lens can be also installed via [snapcraft](https://snapcraft.io/kontena-lens) (Linux only).

Alternatively on Mac:
```
brew cask install lens
```

## Development

> Prerequisites: Nodejs v12, make, yarn

* `make init` - initial compilation, installing deps, etc.
* `make dev` - builds and starts the app
* `make test` - run tests

## Development (advanced)

Allows for faster separate re-runs of some of the more involved processes:

1. `yarn dev:main` compiles electron's main process app part
1. `yarn dev:renderer` compiles electron's renderer app part
1. `yarn dev:extension-types` compile declaration types for `@k8slens/extensions`
1. `yarn dev-run` runs app in dev-mode and auto-restart when main process file has changed

## Development (documentation)

Run a local instance of `mkdocs serve` in a docker container for developing the Lens Documentation.

> Prerequisites: docker, yarn

* `yarn mkdocs-serve-local` - local build and serve of mkdocs with auto update enabled

Go to [localhost:8000](http://127.0.0.1:8000)

## Developer's ~~RTFM~~ recommended list:

- [TypeScript](https://www.typescriptlang.org/docs/home.html) (front-end/back-end)
- [ReactJS](https://reactjs.org/docs/getting-started.html) (front-end, ui)
- [MobX](https://mobx.js.org/) (app-state-management, back-end/front-end)
- [ElectronJS](https://www.electronjs.org/docs) (chrome/node)
- [NodeJS](https://nodejs.org/dist/latest-v12.x/docs/api/) (api docs)



## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/lensapp/lens.