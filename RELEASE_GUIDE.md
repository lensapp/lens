# Release Guide

Releases for this repository are made via running the `create-release-pr` script defined in the `package.json`.
All releases will be made by creating a PR which bumps the version field in the `package.json` and, if necessary, cherry pick the relavent commits from master.

## Prerequisites

- `yarn`
- Running `yarn` (to install all dependencies)
- `gh` (Github's CLI) with a version at least 2.15.0

## Steps

1. If you are making a minor or major release (or prereleases for one) make sure you are on the `master` branch.
1. If you are making a patch release (or a prerelease for one) make sure you are on the `release/v<MAJOR>.<MINOR>` branch.
1. Run `yarn create-release-pr <release-type>`. If you are making a subsequent prerelease release, provide the `--check-commits` flag.
1. If you are checking the commits, type `y<ENTER>` to pick a commit, and `n<ENTER>` to skip it. You will want to skip the commits that were part of previous prerelease releases.
1. Once the PR is created, approved, and then merged the `Release Open Lens` workflow will create a tag and release for you.
1. If you are making a major or minor release, create a `release/v<MAJOR>.<MINOR>` branch and push it to `origin` so that future patch releases can be made from it.
