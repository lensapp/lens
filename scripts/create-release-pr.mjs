#!/usr/bin/env node
/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// This script creates a release PR
import { execSync, exec, spawn } from "child_process";
import commandLineArgs from "command-line-args";
import fse from "fs-extra";
import { basename } from "path";
import semver from "semver";
import { promisify } from "util";

const {
  SemVer,
  valid: semverValid,
  rcompare: semverRcompare,
  lte: semverLte,
} = semver;
const { readJsonSync } = fse;
const execP = promisify(exec);

const options = commandLineArgs([
  {
    name: "type",
    defaultOption: true,
  },
  {
    name: "preid",
  },
]);

const validReleaseValues = [
  "major",
  "minor",
  "patch",
];
const validPrereleaseValues = [
  "premajor",
  "preminor",
  "prepatch",
  "prerelease",
];
const validPreidValues = [
  "alpha",
  "beta",
];

const errorMessages = {
  noReleaseType: `No release type provided. Valid options are: ${[...validReleaseValues, ...validPrereleaseValues].join(", ")}`,
  invalidRelease: (invalid) => `Invalid release type was provided (value was "${invalid}"). Valid options are: ${[...validReleaseValues, ...validPrereleaseValues].join(", ")}`,
  noPreid: `No preid was provided. Use '--preid' to specify. Valid options are: ${validPreidValues.join(", ")}`,
  invalidPreid: (invalid) => `Invalid preid was provided (value was "${invalid}"). Valid options are: ${validPreidValues.join(", ")}`,
  wrongCwd: "It looks like you are running this script from the 'scripts' directory. This script assumes it is run from the root of the git repo",
};

if (!options.type) {
  console.error(errorMessages.noReleaseType);
  process.exit(1);
}

if (validReleaseValues.includes(options.type)) {
  // do nothing, is valid
} else if (validPrereleaseValues.includes(options.type)) {
  if (!options.preid) {
    console.error(errorMessages.noPreid);
    process.exit(1);
  }

  if (!validPreidValues.includes(options.preid)) {
    console.error(errorMessages.invalidPreid(options.preid));
    process.exit(1);
  }
} else {
  console.error(errorMessages.invalidRelease(options.type));
  process.exit(1);
}

if (basename(process.cwd()) === "scripts") {
  console.error(errorMessages.wrongCwd);
}


const currentVersion = new SemVer(readJsonSync("./package.json").version);

console.log(`current version: ${currentVersion.format()}`);
console.log("fetching tags...");
execSync("git fetch --tags --force");

const actualTags = execSync("git tag --list", { encoding: "utf-8" }).split(/\r?\n/).map(line => line.trim());
const [previousReleasedVersion] = actualTags
  .map(semverValid)
  .filter(Boolean)
  .sort(semverRcompare)
  .filter(version => semverLte(version, currentVersion));

const npmVersionArgs = [
  "npm",
  "version",
  options.type,
];

if (options.preid) {
  npmVersionArgs.push(`--preid=${options.preid}`);
}

npmVersionArgs.push("--git-tag-version false");

execSync(npmVersionArgs.join(" "), { stdio: "ignore" });

const newVersion = new SemVer(readJsonSync("./package.json").version);
const newVersionMilestone = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;

console.log(`new version: ${newVersion.format()}`);

const getMergedPrsArgs = [
  "gh",
  "pr",
  "list",
  "--limit=500", // Should be big enough, if not we need to release more often ;)
  "--state=merged",
  "--base=master",
  "--json mergeCommit,title,author,labels,number,milestone",
];

console.log("retreiving last 500 PRs to create release PR body...");
const mergedPrs = JSON.parse(execSync(getMergedPrsArgs.join(" "), { encoding: "utf-8" }));
const milestoneRelevantPrs = mergedPrs.filter(pr => pr.milestone?.title === newVersionMilestone);
const relaventPrsQuery = await Promise.all(
  milestoneRelevantPrs.map(async pr => ({
    pr,
    stdout: (await execP(`git tag v${previousReleasedVersion} --no-contains ${pr.mergeCommit.oid}`)).stdout,
  })),
);
const relaventPrs = relaventPrsQuery
  .filter(query => query.stdout)
  .map(query => query.pr)
  .filter(pr => pr.labels.every(label => label.name !== "skip-changelog"));

const enhancementPrLabelName = "enhancement";
const bugfixPrLabelName = "bug";

const enhancementPrs = relaventPrs.filter(pr => pr.labels.some(label => label.name === enhancementPrLabelName));
const bugfixPrs = relaventPrs.filter(pr => pr.labels.some(label => label.name === bugfixPrLabelName));
const maintenencePrs = relaventPrs.filter(pr => pr.labels.every(label => label.name !== bugfixPrLabelName && label.name !== enhancementPrLabelName));

console.log("Found:");
console.log(`${enhancementPrs.length} enhancement PRs`);
console.log(`${bugfixPrs.length} bug fix PRs`);
console.log(`${maintenencePrs.length} maintenence PRs`);

const prBodyLines = [
  `## Changes since ${previousReleasedVersion}`,
  "",
];

function getPrEntry(pr) {
  return `- ${pr.title} (**[#${pr.number}](https://github.com/lensapp/lens/pull/${pr.number})**) https://github.com/${pr.author.login}`;
}

if (enhancementPrs.length > 0) {
  prBodyLines.push(
    "## 🚀 Features",
    "",
    ...enhancementPrs.map(getPrEntry),
    "",
  );
}

if (bugfixPrs.length > 0) {
  prBodyLines.push(
    "## 🐛 Bug Fixes",
    "",
    ...bugfixPrs.map(getPrEntry),
    "",
  );
}

if (maintenencePrs.length > 0) {
  prBodyLines.push(
    "## 🧰 Maintenance",
    "",
    ...maintenencePrs.map(getPrEntry),
    "",
  );
}

const prBody = prBodyLines.join("\n");
const prBase = newVersion.patch === 0
  ? "master"
  : `release/v${newVersion.major}.${newVersion.minor}`;
const createPrArgs = [
  "pr",
  "create",
  "--base", prBase,
  "--title", `release ${newVersion.format()}`,
  "--label", "skip-changelog",
  "--body-file", "-",
];

const createPrProcess = spawn("gh", createPrArgs, { stdio: "pipe" });
let result = "";

createPrProcess.stdout.on("data", (chunk) => result += chunk);

createPrProcess.stdin.write(prBody);
createPrProcess.stdin.end();

await new Promise((resolve) => {
  createPrProcess.on("close", () => {
    createPrProcess.stdout.removeAllListeners();
    resolve();
  });
});

console.log(result);
