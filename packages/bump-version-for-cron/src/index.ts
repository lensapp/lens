import * as child_process from "child_process";
import { readFile, writeFile } from "fs/promises";
import semver from "semver";
import { promisify } from "util";
import arg from "arg";

const { SemVer } = semver;

const exec = promisify(child_process.exec);

const args = arg({
  "--path": String,
});

const versionJsonPath = args["--path"];

if (!versionJsonPath) {
  throw new Error("Missing required '--path'");
}

try {
  const packageJson = JSON.parse(await readFile(versionJsonPath, "utf-8"));

  const { stdout: gitRevParseOutput } = await exec("git rev-parse --short HEAD");
  const currentHash = gitRevParseOutput.trim();

  const currentVersion = new SemVer(packageJson.version);

  const partialVersion = `${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`;
  const prereleasePart = `cron.${currentHash}`;
  const newVersion = `${partialVersion}-${prereleasePart}`;

  await writeFile(
    versionJsonPath,
    JSON.stringify(
      {
        ...packageJson,
        version: newVersion,
      },
      null,
      2,
    ),
  );

  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `VERSION=${newVersion}`, {
      flag: "a+",
    });
  }

  await exec(`npm run bump-version ${newVersion} -- --yes`);
} catch (error) {
  console.error(error);
  process.exit(1);
}

