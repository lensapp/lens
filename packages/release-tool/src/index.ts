#!/usr/bin/env node
/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import child_process from "child_process";
import { readFile } from "fs/promises";
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
const spawn = promisify(child_process.spawn);

const repoRoot = (await exec("git rev-parse --show-toplevel")).stdout;

if (process.cwd() !== repoRoot) {
  console.error("It looks like you are running this script from the 'scripts' directory. This script assumes it is run from the root of the git repo");
  process.exit(1);
}

const currentVersion = new SemVer(JSON.parse((await readFile("./lerna.json", "utf-8"))).version);

await spawn("npm", ["run", "bump-version"], {
  stdio: "inherit",
});

const newVersion = new SemVer(JSON.parse((await readFile("./lerna.json", "utf-8"))).version);
const newVersionMilestone = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;
const prBranch = `release/v${newVersion.format()}`;

await spawn("git", ["checkout", "-b", prBranch], {
  stdio: "inherit",
});
await spawn("git", ["add", "lerna.json", "packages/*/package.json"], {
  stdio: "inherit",
});
await spawn("git", ["commit", "-sm", `"Release ${newVersion.format()}"`], {
  stdio: "inherit",
});
await spawn("git", ["fetch", "--tags", "--force"], {
  stdio: "inherit",
});

const actualTags = (await exec("git tag --list", { encoding: "utf-8" })).stdout.split(/\r?\n/).map(line => line.trim());
const [previousReleasedVersion] = actualTags
  .map((value) => semverValid(value))
  .filter((v): v is string => typeof v === "string")
  .sort(semverRcompare)
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
const prBase = (await exec("git branch --show-current")).stdout.trim();

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
  if (prBase !== "master" && !(await askQuestion(`Would you like to use #${pr.number}: ${pr.title}? - Y/N`))) {
    return;
  }

  if (prBase !== "master") {
  try {
      await spawn("git", ["cherry-pick", pr.mergeCommit.oid], {
        stdio: "inherit",
      });
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

await spawn("git", ["push", "--set-upstream", "origin", prBranch], {
  stdio: "inherit",
});

await spawn("gh", [
  "pr",
  "create",
  "--base", prBase,
  "--title", `Release ${newVersion.format()}`,
  "--label", "skip-changelog",
  "--label", "release",
  "--milestone", `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`,
  "--body-file", prBody,
], {
  stdio: "inherit"
});
