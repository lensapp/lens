import * as fs from "fs";
import * as path from "path";
import appInfo from "../package.json";
import semver from "semver";

const packagePath = path.join(__dirname, "../package.json");
const versionInfo = semver.parse(appInfo.version);
const buildNumber = process.env.BUILD_NUMBER || "1";
let buildChannel = "alpha";

if (versionInfo.prerelease) {
  if (versionInfo.prerelease.includes("alpha")) {
    buildChannel = "alpha";
  } else {
    buildChannel = "beta";
  }
  appInfo.version = `${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}-${buildChannel}.${versionInfo.prerelease[1]}.${buildNumber}`;
} else {
  appInfo.version = `${appInfo.version}-latest.${buildNumber}`;
}


fs.writeFileSync(packagePath, `${JSON.stringify(appInfo, null, 2)}\n`);
