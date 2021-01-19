# Development

Thank you for taking the time to make a contribution to Lens. The following document is a set of guidelines and instructions for contributing to Lens.

When contributing to this repository, please consider first discussing the change you wish to make by opening an issue.

## Recommended Reading:

- [TypeScript](https://www.typescriptlang.org/docs/home.html) (front-end/back-end)
- [ReactJS](https://reactjs.org/docs/getting-started.html) (front-end, ui)
- [MobX](https://mobx.js.org/) (app-state-management, back-end/front-end)
- [ElectronJS](https://www.electronjs.org/docs) (chrome/node)
- [NodeJS](https://nodejs.org/dist/latest-v12.x/docs/api/) (api docs)

## Local Development Environment

> Prerequisites: Nodejs v12, make, yarn

* `make dev` - builds and starts the app
* `make clean` - cleanup local environment build artifacts

### Developing on Windows

On Windows we only support [Git Bash](https://gitforwindows.org/) (or similar shell) for running commands.

## Github Workflow

We Use [Github Flow](https://guides.github.com/introduction/flow/index.html), so all code changes are tracked via Pull Requests.
A detailed guide on the recommended workflow can be found below:

* [Github Workflow](./github_workflow.md)

## Code Testing

All submitted PRs go through a set of tests and reviews. You can run most of these tests *before* a PR is submitted.
In fact, we recommend it, because it will save on many possible review iterations and automated tests.
The testing guidelines can be found here:

* [Contributor's Guide to Testing](./testing.md)

## License

By contributing, you agree that your contributions will be licensed as described in [LICENSE](https://github.com/lensapp/lens/blob/master/LICENSE).
