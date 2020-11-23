# Github Workflow

<!-- TOC -->
- [Fork The Project](#fork-the-project)
- [Adding the Forked Remote](#adding-the-forked-remote)
- [Create & Rebase Your Feature Branch](#create--rebase-your-feature-branch)
- [Commit & Push](#commit--push)
- [Open a Pull Request](#open-a-pull-request)
  - [Get a code review](#get-a-code-review)
  - [Squash commits](#squash-commits)
  - [Push Your Final Changes](#push-your-final-changes)

<!-- /TOC -->
This guide assumes you have already cloned the upstream repo to your system via git clone.

## Fork The Project

1. Go to [http://github.com/lensapp/lens](http://github.com/lensapp/lens)
2. On the top, right-hand side, click on "fork" and select your username for the fork destination.

## Adding the Forked Remote

```
export GITHUB_USER={ your github's username }

cd $WORKDIR/lens
git remote add $GITHUB_USER git@github.com:${GITHUB_USER}/lens.git

# Prevent push to Upstream
git remote set-url --push origin no_push

# Set your fork remote as a default push target
git push --set-upstream $GITHUB_USER master
```

Your remotes should look something like this:

```
➜ git remote -v
origin  https://github.com/lensapp/lens (fetch)
origin  no_push (push)
my_fork git@github.com:{ github_username }/lens.git (fetch)
my_fork git@github.com:{ github_username }/lens.git (push)
```

## Create & Rebase Your Feature Branch

Create a feature branch:

```
git branch -b my_feature_branch
```

Rebase your branch:

```
git fetch origin

git rebase origin/master
Current branch my_feature_branch is up to date.
```

Please don't use `git pull` instead of the above `fetch / rebase`. `git pull` does a merge, which leaves merge commits. These make the commit history messy and violate the principle that commits ought to be individually understandable and useful.

## Commit & Push

Commit and sign your changes:

```
git commit -m "my commit title" --signoff
```

You can go back and edit/build/test some more, then `commit --amend` in a few cycles.

When ready, push your changes to your fork's repository:

```
git push --set-upstream my_fork my_feature_branch
```

## Open a Pull Request

See [Github Docs](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork).

### Get a code review

Once your pull request has been opened it will be assigned to one or more reviewers, and will go through a series of smoke tests.

Commit changes made in response to review comments should be added to the same branch on your fork.

Very small PRs are easy to review. Very large PRs are very difficult to review.

### Squashing Commits
Commits on your branch should represent meaningful milestones or units of work.
Small commits that contain typo fixes, rebases, review feedbacks, etc should be squashed.

To do that, it's best to perform an [interactive rebase](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History):

#### Example
If you PR has 3 commits, count backwards from your last commit using `HEAD~3`:
```
git rebase -i HEAD~3
```
Output would be similar to this:
```
pick f7f3f6d Changed some code
pick 310154e fixed some typos
pick a5f4a0d made some review changes

# Rebase 710f0f8..a5f4a0d onto 710f0f8
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
# .       create a merge commit using the original merge commit's
# .       message (or the oneline, if no original merge commit was
# .       specified). Use -c <commit> to reword the commit message.
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```
Use a command line text editor to change the word `pick` to `fixup` for the commits you want to squash, then save your changes and continue the rebase:

Per the output above, you can see that:
```
fixup <commit> = like "squash", but discard this commit's log message
```
Which means that when rebased, the commit message "fixed some typos" will be removed, and squashed with the parent commit.

### Push Your Final Changes

Once done, you can push the final commits to your branch:
```
git push --force
```
You can run multiple iteration of `rebase`/`push -f`, if needed.
