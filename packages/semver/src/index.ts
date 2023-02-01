#!/usr/bin/env node
/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { SemVer } from "semver";
import commandLineArgs from "command-line-args";

const options = commandLineArgs([
  {
    name: "version",
    defaultOption: true,
  },
  {
    name: "major",
    type: Boolean,
  },
  {
    name: "minor",
    type: Boolean,
  },
  {
    name: "patch",
    type: Boolean,
  },
  {
    name: "prerelease",
    type: (input) => {
      if (!input || input === "true") {
        return true;
      }

      const asNumber = Number(input);

      if (Number.isInteger(asNumber) && asNumber >= 0) {
        return asNumber;
      }

      throw new Error("Invalid --prerelease value, must be either true (default), or a non-negative integrer");
    },
  },
  {
    name: "json",
    type: Boolean,
  },
]);

if (!options.version || typeof options.version !== "string") {
  console.error("Missing version");
  process.exit(1);
}

const showMajor = Boolean(options.major);
const showMinor = Boolean(options.minor);
const showPatch = Boolean(options.patch);
const showPrerelease = options.prerelease !== undefined;
const showJson = Boolean(options.json);

const showOptionsSet = [+showMajor, +showMinor, +showPatch, +showPrerelease, +showJson].reduce((prev, cur) => prev + cur, 0);

if (showOptionsSet === 0) {
  console.error("One of the following must be provided: --major, --minor, --patch, --prerelease, --json");
  process.exit(1);
}

if (showOptionsSet > 1) {
  console.error("Only one of the following may be provided: --major, --minor, --patch, --prerelease, --json");
  process.exit(1);
}

const version = new SemVer(options.version);

if (showMajor) {
  console.log(version.major.toString());
} else if (showMinor) {
  console.log(version.major.toString());
} else if (showPatch) {
  console.log(version.patch.toString());
} else if (showPrerelease) {
  if ((options.prerelease ?? true) === true) {
    console.log(JSON.stringify(version.prerelease))
  } else if (version.prerelease.length > options.prerelease) {
    console.log(version.prerelease[options.prerelease].toString());
  }
} else if (showJson) {
  console.log(JSON.stringify({
    major: version.major,
    minor: version.minor,
    patch: version.patch,
    prerelease: version.prerelease,
  }));
}
