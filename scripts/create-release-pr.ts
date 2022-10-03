/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import child_process from "child_process";
import commandLineArgs from "command-line-args";
import fse from "fs-extra";
import { basename } from "path";
import { createInterface } from "readline";
import semver from "semver";
import { promisify } from "util";

const {
  SemVer,
  valid: semverValid,
  rcompare: semverRcompare,
  lte: semverLte,
} = semver;
const exec = promisify(child_process.exec);
const execFile = promisify(child_process.execFile);

const options = commandLineArgs([
  {
    name: "type",
    defaultOption: true,
  },
  {
    name: "preid",
  },
  {
    name: "check-commits",
    type: Boolean,
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

const packageJson = await fse.readJson("./package.json");
const currentVersion = new SemVer(packageJson.version);

console.log(`current version: ${currentVersion.format()}`);

const newVersion = currentVersion.inc(options.type, options.preid);
const newVersionMilestone = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;
const prBranch = `release/v${newVersion.format()}`;

await fse.writeJson("./package.json", { ...packageJson, version: newVersion.format() }, { spaces: 2 });
await exec(`git checkout -b ${prBranch}`);
await exec("git add package.json");
await exec(`git commit -sm "Release ${newVersion.format()}"`);

console.log(`new version: ${newVersion.format()}`);

console.log("fetching tags...");
await exec("git fetch --tags --force");

const actualTags = (await exec("git tag --list", { encoding: "utf-8" })).stdout.split(/\r?\n/).map(line => line.trim());
const [previousReleasedVersion] = actualTags
  .map((value) => semverValid(value))
  .filter((v): v is string => typeof v === "string")
  .sort((l, r) => semverRcompare(l, r))
  .filter(version => semverLte(version, currentVersion));

const getMergedPrsArgs = [
  "gh",
  "pr",
  "list",
  "--limit=500", // Should be big enough, if not we need to release more often ;)
  "--state=merged",
  "--base=master",
  "--json mergeCommit,title,author,labels,number,milestone,mergedAt",
];

interface GithubPrData {
  author: {
    login: string;
  };
  labels: {
    id: string;
    name: string;
    description: string;
    color: string;
  }[];
  mergeCommit: {
    oid: string;
  };
  mergedAt: string;
  milestone: {
    number: number;
    title: string;
    description: string;
    dueOn: null | string;
  };
  number: number;
  title: string;
}

interface ExtendedGithubPrData extends Omit<GithubPrData, "mergedAt"> {
  mergedAt: Date;
}

console.log("retreiving last 500 PRs to create release PR body...");
const mergedPrs = JSON.parse((await exec(getMergedPrsArgs.join(" "), { encoding: "utf-8" })).stdout) as GithubPrData[];
const milestoneRelevantPrs = mergedPrs.filter(pr => pr.milestone?.title === newVersionMilestone);
const relaventPrsQuery = await Promise.all(
  milestoneRelevantPrs.map(async pr => ({
    pr,
    stdout: (await exec(`git tag v${previousReleasedVersion} --no-contains ${pr.mergeCommit.oid}`)).stdout,
  })),
);
const relaventPrs = relaventPrsQuery
  .filter(query => query.stdout)
  .map(query => query.pr)
  .filter(pr => pr.labels.every(label => label.name !== "skip-changelog"))
  .map(pr => ({ ...pr, mergedAt: new Date(pr.mergedAt) } as ExtendedGithubPrData))
  .sort((left, right) => {
    const leftAge = left.mergedAt.valueOf();
    const rightAge = right.mergedAt.valueOf();

    if (leftAge === rightAge) {
      return 0;
    }

    if (leftAge > rightAge) {
      return 1;
    }

    return -1;
  });

const enhancementPrLabelName = "enhancement";
const bugfixPrLabelName = "bug";

const isEnhancementPr = (pr: ExtendedGithubPrData) => pr.labels.some(label => label.name === enhancementPrLabelName);
const isBugfixPr = (pr: ExtendedGithubPrData) => pr.labels.some(label => label.name === bugfixPrLabelName);

const prLines = {
  enhancement: [] as string[],
  bugfix: [] as string[],
  maintenence: [] as string[],
};

function getPrEntry(pr: ExtendedGithubPrData) {
  return `- ${pr.title} (**[#${pr.number}](https://github.com/lensapp/lens/pull/${pr.number})**) https://github.com/${pr.author.login}`;
}

const rl = createInterface(process.stdin);
const prBase = newVersion.patch === 0
  ? "master"
  : `release/v${newVersion.major}.${newVersion.minor}`;

function askQuestion(question: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    function _askQuestion() {
      console.log(question);

      rl.once("line", (answer) => {
        const cleaned = answer.trim().toLowerCase();

        if (cleaned === "y") {
          resolve(true);
        } else if (cleaned === "n") {
          resolve(false);
        } else {
          _askQuestion();
        }
      });
    }

    _askQuestion();
  });
}

async function handleRelaventPr(pr: ExtendedGithubPrData) {
  if (options["check-commits"] && !(await askQuestion(`Would you like to use #${pr.number}: ${pr.title}? - Y/N`))) {
    return;
  }

  if (prBase !== "master") {
    try {
      const promise = exec(`git cherry-pick ${pr.mergeCommit.oid}`);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      promise.child.stdout!.pipe(process.stdout);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      promise.child.stderr!.pipe(process.stderr);

      await promise;
    } catch {
      console.error(`Failed to cherry-pick ${pr.mergeCommit.oid}, please resolve conflicts and then press enter here:`);
      await new Promise<void>(resolve => rl.once("line", () => resolve()));
    }
  }

  if (isEnhancementPr(pr)) {
    prLines.enhancement.push(getPrEntry(pr));
  } else if (isBugfixPr(pr)) {
    prLines.bugfix.push(getPrEntry(pr));
  } else {
    prLines.maintenence.push(getPrEntry(pr));
  }
}

for (const pr of relaventPrs) {
  await handleRelaventPr(pr);
}

rl.close();

const prBodyLines = [
  `## Changes since ${previousReleasedVersion}`,
  "",
  ...(
    prLines.enhancement.length > 0
      ? [
        "## 🚀 Features",
        "",
        ...prLines.enhancement,
        "",
      ]
      : []
  ),
  ...(
    prLines.bugfix.length > 0
      ? [
        "## 🐛 Bug Fixes",
        "",
        ...prLines.bugfix,
        "",
      ]
      : []
  ),
  ...(
    prLines.maintenence.length > 0
      ? [
        "## 🧰 Maintenance",
        "",
        ...prLines.maintenence,
        "",
      ]
      : []
  ),
];
const prBody = prBodyLines.join("\n");
const createPrArgs = [
  "pr",
  "create",
  "--base", prBase,
  "--title", `Release ${newVersion.format()}`,
  "--label", "skip-changelog",
  "--body-file", "-",
];

await exec(`git push --set-upstream origin ${prBranch}`);

const createPrProcess = execFile("gh", createPrArgs);

createPrProcess.child.stdout?.pipe(process.stdout);
createPrProcess.child.stderr?.pipe(process.stderr);

createPrProcess.child.stdin?.write(prBody);
createPrProcess.child.stdin?.end();

await createPrProcess;
