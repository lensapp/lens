# Lens | The Kubernetes IDE

[![Build Status](https://dev.azure.com/lensapp/lensapp/_apis/build/status/lensapp.lens?branchName=master)](https://dev.azure.com/lensapp/lensapp/_build/latest?definitionId=1&branchName=master)
[![Releases](https://img.shields.io/github/downloads/lensapp/lens/total.svg)](https://github.com/lensapp/lens/releases)
[![Chat on Slack](https://img.shields.io/badge/chat-on%20slack-blue.svg?logo=slack&longCache=true&style=flat)](https://join.slack.com/t/k8slens/shared_invite/enQtOTc5NjAyNjYyOTk4LWU1NDQ0ZGFkOWJkNTRhYTc2YjVmZDdkM2FkNGM5MjhiYTRhMDU2NDQ1MzIyMDA4ZGZlNmExOTc0N2JmY2M3ZGI)

Lens is the only IDE you’ll ever need to take control of your Kubernetes clusters. It is a standalone application for MacOS, Windows and Linux operating systems. It is open source and free.

[![Screenshot](./images/screenshot.png)](https://youtu.be/04v2ODsmtIs)

## What makes Lens special?

* Amazing usability and end user experience
* Multi cluster management; Support for hundreds of clusters
* Standalone application; No need to install anything in-cluster
* Real-time cluster state visualization
* Resource utilization charts and trends with history powered by built-in Prometheus
* Terminal access to nodes and containers
* Performance optimized to handle massive clusters (tested with a cluster running 25k pods)
* Full support for Kubernetes RBAC

## Installation

Download a pre-built package from the [releases](https://github.com/lensapp/lens/releases) page. Lens can be also installed via [snapcraft](https://snapcraft.io/kontena-lens) (Linux only).

## Development

> Prerequisities: Nodejs v12, make, yarn

* `make download-bins` - downloads bundled binaries to dev environment
* `make dev` - builds and starts the app
* `make test` - run tests

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/lensapp/lens.
