## Testing Your Code

Lens uses github actions to run automated tests on any PR, before merging.
However, a PR will not be reviewed before all tests are green, so to save time and prevent your PR from going stale, it is best to test it before submitting the PR.

### Run Local Verifications

Please run the following style and formatting commands and fix/check-in any changes:

#### 1. Linting

We use [ESLing](https://eslint.org/) for style verification.
In the repository's root directory, simply run:

```
make lint
```

#### 3. Pre-submit Flight Checks

In the repository root directory, make sure that:

 * `make build` runs successfully.
 * `make test` runs successfully.
 * `make integration` runs successfully (some tests require minikube running).

 Please note that this last test is prone to "flakiness", so it might fail on occasion. If it fails constantly, take a deeper look at your code to find the source of the problem.

If you find that all tests passed, you may open a pull request upstream.

### Opening A Pull Request

#### Draft Mode

You may open a pull request in [draft mode](https://github.blog/2019-02-14-introducing-draft-pull-requests).
All automated tests will still run against the PR, but the PR will not be assigned for review.
Once a PR is ready for review, transition it from Draft mode, and code owners will be notified.

#### Pre-Requisites for PR Merge

In order for a PR to be merged, the following conditions should exist:
1. The PR has passed all the automated tests (style, build & conformance tests).
2. PR commits have been signed with the `--signoff` option.
3. PR was reviewed and approved by a code owner.
4. PR is rebased against upstream's master branch.
