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
      
      where `<prerelease-id>` is generally one of:
        - `alpha`
        - `beta`
        - `rc`
  
    This assumes origin is set to https://github.com/lensapp/lens.git. If not then set GIT_REMOTE to the remote that is set to https://github.com/lensapp/lens.git. For example run `GIT_REMOTE=upstream make release-version ...`
1. Open the PR (git should have printed a link to GitHub in the console) with the contents of all the accepted PRs since the last release. The PR description needs to be filled with the draft release description. From https://github.com/lensapp/lens click on Releases, the draft release should be first in the list, click `Edit` and copy/paste the markdown to the PR description. Add the `skip-changelog` label and click `Create Pull Request`.
1. After the PR is accepted and passes CI (and before merging), go to the same branch and run `make tag-release` (set GIT_REMOTE if necessary). This additionally runs the azure jobs to build the binaries and put them on S3.
1. If the CI fails at this stage the problem needs to be fixed. Sometimes an azure job fails due to outside service issues (e.g. Apple signing occasionally fails), in which case the specific azure job can be rerun from https://dev.azure.com/lensapp/lensapp/_build. Otherwise changes to the codebase may need to be done and committed to the release branch and pushed to https://github.com/lensapp/lens. CI will run again. As well the release tag needs to be manually set to this new commit. You can do something like:
    - `git push origin :refs/tags/vX.Y.Z-beta.N` (removes the tag from https://github.com/lensapp/lens)
    - `git tag -fa vX.Y.Z-beta.N` (move the tag locally to the current commit)
    - `git push origin --tags` (update the tags on https://github.com/lensapp/lens to reflect this local change)

1. Once CI passes again go to the releases tab on GitHub. You can use the existing draft release prepared by k8slens-bot (select the correct tag). Or you can create a new release from the tag that was created, and make sure that the change log is the same as that of the PR, and the title is the tag. Either way, click the prerelease checkbox if this is not a new major, minor, or patch version before clicking `Publish release`.
1. Merge the release PR after the release is published. GitHub should delete the branch once it is merged.
1. If you have just released a new major or minor version then create a new `release/vMAJOR.MINOR` branch from that same tag and push it to https://github.com/lensapp/lens. Given the commit of the merged release PR from the master branch you can do this like

    `git push origin <commit>:refs/heads/release/vX.Y`

    This will be the target for future patch releases and shouldn't be deleted.

Other tasks
 post release:
 - generate a changelog from the prerelease descriptions (for major/minor releases)
 - announce the release on lens and lens-hq slack channels (release is announced automatically on the community slack lens channel through the above publishing process)
 - announce on lens-hq that master is open for PR merges for the next release (for major/minor releases)
 - update issues on github (bump those that did not make it into the release to a subsequent release) (for major/minor releases)