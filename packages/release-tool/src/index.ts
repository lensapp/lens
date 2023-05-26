#!/usr/bin/env node
/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import chalk from "chalk";
import child_process, { spawn as _spawn } from "child_process";
import { readFile } from "fs/promises";
import inquirer from "inquirer";
import { createInterface, ReadLine } from "readline";
import semver from "semver";
import { promisify } from "util";
import { Octokit } from "@octokit/core";
import type { components } from "@octokit/openapi-types";

type SemVer = semver.SemVer;

const { SemVer } = semver;
const _exec = promisify(child_process.exec);
const _execFile = promisify(child_process.execFile);

const exec = ((cmd, ...args) => {
  console.log("EXEC", cmd);

  return _exec(cmd, ...args as any[]);
}) as typeof _exec;

const execFile = ((file, ...rest) => {
  if (Array.isArray(rest[0])) {
    console.log("EXEC-FILE", file, rest[0]);
  } else {
    console.log("EXEC-FILE", file);
  }

  return _execFile(file, ...rest as [any, any]);
}) as typeof _execFile;

const spawn = ((file, ...args) => {
  console.log("SPAWN", file);

  return _spawn(file, ...args as any[]);
}) as typeof _spawn;

async function pipeExecFile(file: string, args: string[], opts?: { stdin: string }) {
  const p = execFile(file, args);

  p.child.stdout?.pipe(process.stdout);
  p.child.stderr?.pipe(process.stderr);

  if (opts) {
    p.child.stdin?.end(opts.stdin);
  }

  await p;
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || (await execFile("gh", ["auth", "token"])).stdout.trim(),
});

interface GithubPrData {
  authorLogin: string | undefined;
  labels: components["schemas"]["label"][];
  mergeCommitSha: string;
  mergedAt: string;
  milestone: components["schemas"]["milestone"];
  number: number;
  title: string;
}

interface ExtendedGithubPrData extends Omit<GithubPrData, "mergedAt"> {
  mergedAt: Date;
  shouldAttemptCherryPick: boolean;
}

async function getCurrentBranch(): Promise<string> {
  return (await exec("git branch --show-current")).stdout.trim();
}

async function getAbsolutePathToRepoRoot(): Promise<string> {
  return (await exec("git rev-parse --show-toplevel")).stdout.trim();
}

async function fetchAllGitTags(): Promise<string[]> {
  await execFile("git", ["fetch", "--tags", "--force"]);

  const { stdout } = await exec("git tag --list", { encoding: "utf-8" });

  return stdout
    .split(/\r?\n/)
    .map(line => line.trim());
}

function bumpPackageVersions() {
  const bumpPackages = spawn(`npm run bump-version ${process.env.BUMP_PACKAGE_ARGS ?? ""}`, {
    stdio: "inherit",
    shell: true,
  });
  const cleaners: (() => void)[] = [
    () => bumpPackages.stdout?.unpipe(),
    () => bumpPackages.stderr?.unpipe(),
  ];
  const cleanup = () => cleaners.forEach(clean => clean());

  return new Promise<void>((resolve, reject) => {
    const onExit = (code: number | null) => {
      cleanup();
      if (code) {
        reject(new Error(`"npm run bump-version" failed with code ${code}`));
      } else {
        resolve();
      }
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    bumpPackages.once("error", onError);
    cleaners.push(() => bumpPackages.off("error", onError));

    bumpPackages.once("exit", onExit);
    cleaners.push(() => bumpPackages.off("exit", onExit));
  });
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}

function findClosestVersionTagLessThanVersion(tags: string[], version: SemVer): string {
  const lessThanTags = tags
    .map((value) => semver.parse(value))
    .filter(isDefined)
    .filter(version => !version.prerelease.includes("cron"))
    .sort(semver.rcompare)
    .filter(v => semver.lte(v, version));

  assert(lessThanTags.length > 0, `Cannot find version tag less than ${version.format()}`);

  return lessThanTags[0].format();
}

async function getCurrentVersionOfSubPackage(packageName: string): Promise<SemVer> {
  const packageJson = JSON.parse(await readFile(`./packages/${packageName}/package.json`, "utf-8"));

  return new SemVer(packageJson.version);
}

async function checkCurrentWorkingDirectory(): Promise<void> {
  process.chdir(await getAbsolutePathToRepoRoot());
}

function formatSemverForMilestone(version: SemVer): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function formatVersionForPickingPrs(version: SemVer): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

async function deleteAndClosePreviousReleaseBranch(prBase: string, prBranch: string) {
  const pullRequests = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner: "lensapp",
    repo: "lens",
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });

  const previousReleasePR = pullRequests.data.find(pr => pr.base.ref === prBase && pr.head.ref === prBranch);

  if (!previousReleasePR) {
    return;
  }

  await octokit.request("PATCH /repos/{owner}/{repo}/pulls/{pull_number}", {
    owner: "lensapp",
    repo: "lens",
    pull_number: previousReleasePR.number,
    state: "closed",
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });

  await pipeExecFile("git", [
    "push",
    "origin",
    "--delete",
    prBranch,
  ]);
}

async function createReleaseBranchAndCommit(prBase: string, version: SemVer, prBody: string): Promise<void> {
  const prBranch = `release/v${version.format()}`;

  await pipeExecFile("git", ["checkout", "-b", prBranch]);
  await pipeExecFile("git", ["add", "."]);

  try {
    await pipeExecFile("git", ["commit", "-sm", `Release ${version.format()}`]);
  } catch (error) {
    if (process.env.FAIL_ON_NO_CHANGES === "false") {
      console.log("No changes to commit");
      return;
    }

    throw error;
  }

  await deleteAndClosePreviousReleaseBranch(prBase, prBranch);

  await pipeExecFile("git", ["push", "--set-upstream", "origin", prBranch]);

  const newReleasePR = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner: "lensapp",
    repo: "lens",
    title: `Release ${version.format()}`,
    head: prBranch,
    base: prBase,
    body: prBody,
    draft: false,
    maintainer_can_modify: true,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });
  await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/labels", {
    owner: "lensapp",
    repo: "lens",
    issue_number: newReleasePR.data.number,
    labels: ["release", "skip-changelog"],
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });
  const milestones = await octokit.request("GET /repos/{owner}/{repo}/milestones", {
    owner: "lensapp",
    repo: "lens",
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });
  const milestoneTitle = formatSemverForMilestone(version);
  const milestoneNumber = milestones.data.find(milestone => milestone.title === milestoneTitle)?.number;

  if (!milestoneNumber) {
    throw new Error(`Cannot find milestone for ${milestoneTitle}`);
  }

  await octokit.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
    owner: "lensapp",
    repo: "lens",
    issue_number: newReleasePR.data.number,
    milestone: milestoneNumber,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });
}

function sortExtendedGithubPrData(left: ExtendedGithubPrData, right: ExtendedGithubPrData): number {
  const leftAge = left.mergedAt.valueOf();
  const rightAge = right.mergedAt.valueOf();

  if (leftAge === rightAge) {
    return 0;
  }

  if (leftAge > rightAge) {
    return 1;
  }

  return -1;
}

async function getRelevantPRs(previousReleasedVersion: string, baseBranch: string): Promise<ExtendedGithubPrData[]> {
  console.log(`retrieving previous 200 PRs from ${baseBranch}...`);

  const milestone = formatVersionForPickingPrs(await getCurrentVersionOfSubPackage("core"));
  const mergedPrsDataPromises = [1, 2, 3, 4, 5].map(page => octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner: "lensapp",
    repo: "lens",
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
    state: "closed",
    base: baseBranch,
    per_page: 100,
    page,
  }));
  const milestoneRelevantPrs = (await Promise.all(mergedPrsDataPromises))
    .flatMap(response => response.data)
    .filter(pr => pr.milestone?.title === milestone)
    .filter(pr => (pr.merged_at !== null && pr.merge_commit_sha !== null));

  const relevantPrsQuery = await Promise.all(
    milestoneRelevantPrs.map(async pr => ({
      pr,
      stdout: (await exec(`git tag v${previousReleasedVersion} --no-contains ${pr.merge_commit_sha}`)).stdout,
    })),
  );

  return relevantPrsQuery
    .filter(query => query.stdout)
    .map(query => query.pr)
    .filter(pr => pr.labels.every(label => label.name !== "skip-changelog"))
    .map((pr): ExtendedGithubPrData => ({
      authorLogin: pr.user?.login,
      labels: pr.labels,
      mergeCommitSha: pr.merge_commit_sha as string,
      number: pr.number,
      title: pr.title,
      milestone: pr.milestone as components["schemas"]["milestone"],
      mergedAt: new Date(pr.merged_at as string),
      shouldAttemptCherryPick: baseBranch === "master",
    }))
    .sort(sortExtendedGithubPrData);
}

function formatPrEntry(pr: ExtendedGithubPrData) {
  return `- ${pr.title} (**[#${pr.number}](https://github.com/lensapp/lens/pull/${pr.number})**) https://github.com/${pr.authorLogin}`;
}

const isEnhancementPr = (pr: ExtendedGithubPrData) => pr.labels.some(label => label.name === "enhancement");
const isBugfixPr = (pr: ExtendedGithubPrData) => pr.labels.some(label => label.name === "bug");

const cherryPickCommitWith = (rl: ReadLine) => async (commit: string) => {
  try {
    await pipeExecFile("git", ["cherry-pick", commit]);
  } catch {
    console.error(chalk.bold("Please resolve conflicts in a separate terminal and then press enter here..."));
    await new Promise<void>(resolve => rl.once("line", () => resolve()));
  }
};

async function pickWhichPRsToUse(prs: ExtendedGithubPrData[]): Promise<ExtendedGithubPrData[]> {
  const answers = await inquirer.prompt<{ commits: number[] }>({
    type: "checkbox",
    name: `commits`,
    message: "Pick which commits to use...",
    default: [],
    choices: prs.map(pr => ({
      checked: true,
      key: pr.number,
      name: `#${pr.number}: ${pr.title} (https://github.com/lensapp/lens/pull/${pr.number})`,
      value: pr.number,
      short: `#${pr.number}`,
    })),
    loop: false,
  });

  return prs.filter(pr => answers.commits.includes(pr.number));
}

function formatChangelog(previousReleasedVersion: string, prs: ExtendedGithubPrData[]): string {
  const enhancementPrLines: string[] = [];
  const bugPrLines: string[] = [];
  const maintenancePrLines: string[] = [];

  for (const pr of prs) {
    if (isEnhancementPr(pr)) {
      enhancementPrLines.push(formatPrEntry(pr));
    } else if (isBugfixPr(pr)) {
      bugPrLines.push(formatPrEntry(pr));
    } else {
      maintenancePrLines.push(formatPrEntry(pr));
    }
  }

  if (enhancementPrLines.length > 0) {
    enhancementPrLines.unshift("## 🚀 Features", "");
    enhancementPrLines.push("");
  }

  if (bugPrLines.length > 0) {
    bugPrLines.unshift("## 🐛 Bug Fixes", "");
    bugPrLines.push("");
  }

  if (maintenancePrLines.length > 0) {
    maintenancePrLines.unshift("## 🧰 Maintenance", "");
    maintenancePrLines.push("");
  }

  return [
    `## Changes since ${previousReleasedVersion}`,
    "",
    ...enhancementPrLines,
    ...bugPrLines,
    ...maintenancePrLines,
  ].join("\n");
}

async function getCommitsOfPr(pr: ExtendedGithubPrData) {
  const commits: components["schemas"]["commit"][] = [];

  for (let page = 1; ; page += 1) {
    const pageResult = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/commits", {
      owner: "lensapp",
      repo: "lens",
      pull_number: pr.number,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      },
      per_page: 100,
      page,
    });

    commits.push(...pageResult.data);

    if (pageResult.data.length < 100) {
      break;
    }
  }

  return commits;
}

async function computeIfPrWasSquashed(pr: ExtendedGithubPrData, commits: components["schemas"]["commit"][]): Promise<boolean> {
  const { stdout: mergeCommitSubject } = await execFile("git", ["log", "-1", "--format=%s", pr.mergeCommitSha]);

  return commits.every(commit => commit.commit.message !== mergeCommitSubject);
}

async function cherryPickCommits(prs: ExtendedGithubPrData[]): Promise<void> {
  const rl = createInterface(process.stdin);
  const cherryPickCommit = cherryPickCommitWith(rl);

  for (const pr of prs) {
    if (pr.shouldAttemptCherryPick) {
      const commits = await getCommitsOfPr(pr);
      const wasSquashed = await computeIfPrWasSquashed(pr, commits);

      if (wasSquashed) {
        await cherryPickCommit(pr.mergeCommitSha);
      } else {
        for (const commit of commits) {
          await cherryPickCommit(commit.sha);
        }
      }
    } else {
      console.log(`Skipping cherry picking of #${pr.number} - ${pr.title}`);
    }
  }

  rl.close();
}

async function pickRelevantPrs(prs: ExtendedGithubPrData[], isMasterBranch: boolean): Promise<ExtendedGithubPrData[]> {
  if (prs.length === 0) {
    throw new Error("Cannot pick relevant PRs for release if there are none. Are the milestones on github correct?");
  }

  if (isMasterBranch || process.env.PICK_ALL_PRS === "true") {
    return prs;
  }

  let selectedPrs: ExtendedGithubPrData[];

  do {
    selectedPrs = await pickWhichPRsToUse(prs);
  } while (selectedPrs.length === 0 && (console.warn("[WARNING]: must pick at least one commit"), true));

  await cherryPickCommits(selectedPrs);

  return selectedPrs;
}

async function setExtensionApiDepAsExact(coreVersion: SemVer) {
  await pipeExecFile("npm", ["install", "--save-exact", "--workspace=@k8slens/extensions", `@k8slens/core@${coreVersion.format()}`]);
}

async function createRelease(): Promise<void> {
  await checkCurrentWorkingDirectory();

  const currentK8slensCoreVersion = await getCurrentVersionOfSubPackage("core");
  const prBase = await getCurrentBranch();
  const isMasterBranch = prBase === "master";
  const tags = await fetchAllGitTags();
  const previousReleasedVersion = findClosestVersionTagLessThanVersion(tags, currentK8slensCoreVersion);

  if (isMasterBranch) {
    await bumpPackageVersions();
  }

  const relevantPrs = await getRelevantPRs(previousReleasedVersion, "master");

  if (prBase !== "master") {
    relevantPrs.push(...await getRelevantPRs(previousReleasedVersion, prBase));
  }

  const selectedPrs = await pickRelevantPrs(relevantPrs, isMasterBranch);

  if (selectedPrs.length === 0) {
    console.log(`No PRs have been found relating to ${previousReleasedVersion}, stopping...`);
    return;
  }

  const prBody = formatChangelog(previousReleasedVersion, selectedPrs);

  if (!isMasterBranch) {
    await bumpPackageVersions();
  }

  const newK8slensCoreVersion = await getCurrentVersionOfSubPackage("core");

  await setExtensionApiDepAsExact(newK8slensCoreVersion);
  await createReleaseBranchAndCommit(prBase, newK8slensCoreVersion, prBody);
}

await createRelease();
