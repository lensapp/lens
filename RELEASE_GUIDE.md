# Release Guide

Releases for this repository are made via running the `create-release-pr` script defined in the `package.json`.
All releases will be made by creating a PR which bumps the version field in the `package.json` and, if necessary, cherry pick the relevant commits from master.

## Prerequisites

- `npm`
- Running `npm install`
- `gh` (Github's CLI) with a version at least 2.15.0

## Steps

1. If you are making a minor or major release (or prereleases of one) make sure you are on the `master` branch.
1. If you are making a patch release (or a prerelease for one) make sure you are on the `release/v<MAJOR>.<MINOR>` branch.
1. Run `npm run create-release-pr`.
    - NOTES:
        - The PRs that picked are based on which milestone they are marked as being a part of and if they have already been released
        - The milestone is automatically computed from the version of the `@k8slens/core`.
        If there is are any prerelease tags then the milestone will be for the next stable version (no prereleases).
        Otherwise, it will be for the next patch version.
1. Pick the PRs that you want to include in this release using the keys listed.
    - If you are making a patch release this might include fixing up some cherry-picking of commits. These actions should be done in a separate terminal.
    - If a package version is having a major version bump then `npm` will complain about `peerDependency` conflicts. These will have to be fixed up separately.
1. Once the PR is created, approved, and then merged the `Release Open Lens` workflow will create a tag and release for you.
1. If you are making a major or minor release, create a `release/v<MAJOR>.<MINOR>` branch and push it to `origin` so that future patch releases can be made from it.
1. If you released a major or minor version, create a new patch milestone and move all bug issues to that milestone and all enhancement issues to the next minor milestone.
1. If you released a patch version, create a new patch milestone for the next patch version and move all the issues and PRs (open or closed) that weren't included in the current release to that milestone.
1. Close the milestone related to the release that was just made (if not a prerelease release).
1. If you released a patch version and it contains PRs that targeted `release/v<MAJOR>.<MINOR>` make a new PR targeting master and include all the relevant PRs as cherry-picks. This PR should have the `skip-changelog` label and have a milestone of the next minor.
