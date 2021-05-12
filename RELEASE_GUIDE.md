# Release Process

Lens releases are built by CICD automatically on git tags. The typical release process flow is the following:

1. From a clean and up to date `master` run `make release-version <version-type>` where `<version-type>` is one of the following:
    - `major`
    - `minor`
    - `patch`
    - `premajor`
    - `preminor`
    - `prepatch`
    - `prerelease [--preid=<prerelease-id>]`
      - where `<prerelease-id>` is generally one of:
        - `alpha`
        - `beta`
        - `rc`
1. Create PR (git should have printed a link to GitHub in the console) with the contents of all the accepted PRs since the last release.
1. After the PR is accepted and passes CI. Go to the same branch and run `make tag-release`
1. Once CI passes again go to the releases tab on GitHub, create a new release from the tag that was created, make sure that the change log is the same as that of the PR.
1. Merge the release PR after the release is published. GitHub should delete the branch once it is merged.
1. If you have just released a new major or minor version then create a new `vMAJOR.MINOR` branch from that same tag and push it to master. This will be the target for future patch releases and shouldn't be deleted.
