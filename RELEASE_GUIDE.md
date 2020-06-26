# Release Process

Lens releases are built by CICD automatically on git tags. The typical release process flow is the following:

1. Create a release branch `release/v{version}` from `master` branch or from existing release branch (for example, `release/v3.5`) on patch releases.
2. Update changelog in `static/RELEASE_NOTES.md` and bump version in `package.json`.
3. Create PR and put change log in description field.
4. After the PR is accepted, create a tag from release branch.
5. Push tag to GitHub.
6. Publish automatically created GitHub release.
7. Merge the release PR after the release is published and delete the release branch from GitHub.