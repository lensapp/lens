# Publishing Extensions

To be able to easily share extensions with users they need to be published somewhere.
Lens currently only supports installing extensions from tarballs.
All hosted extensions must, therefore, be retrievable in a tarball.

## Places To Host Your Extension

We recommend to host your extension somewhere on the web so that it is easy for people to search for and download it.
We recommend either hosting it as an NPM package on https://www.npmjs.com or through GitHub releases.
We recommend against using GitHub packages (https://github.com/features/packages) as it requires a GitHub token to access the package.

### Publishing via NPM

This is the easiest method of publishing as NPM comes built in with mechanism to get a link to download the package as a tarball.
Once you have set up an account with NPM (https://www.npmjs.com/signup) and logged in with their CLI (`npm login`) you will be ready to publish.

* Run `npm version <major|minor|patch>` to bump the version of your extension by the appropriate amount.
* Run `npm publish` to publish your extension to NPM
* Run `git push && git push --tags` to push the commit that NPM creates to your git remote.

It is probably a good idea to put into your README.md the following instructions for your users to get the tarball download link.

```bash
npm view <extension-name> dist.tarball
```

This will output the link that they will need to give to lens to install your extension.

### Publish via GitHub Releases

Another method of publishing your extensions is to do so with the releases mechanism built into GitHub.
We recommend reading [GitHub's Releases Documentation](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/managing-releases-in-a-repository) for how to actually do the steps of a release.
The following will be a quick walk through on how to make the tarball which will be the released file.

### Making a Tarball of your extension

While this is necessary for hosting on GitHub releases, this is also the means for creating a tarball if you plan on hosting on a different file hosting platform.

Say you have your project folder at `~/my-extension/` and you want to create `~/my-extension.tar.gz` we need to do the following within your git repo:

```
git archive --format=tar.gz -o ../my-extension.tar.gz master
```

This command will make a tarball called `my-extension.tar.gz` in your git repo's parent directory containing all git tracked files.
This should be what you want to publish since it is not recommended to track your `build` or `node_modules` folders.
