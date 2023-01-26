/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */ import { SemVer } from "semver";
import commandLineArgs from "command-line-args";
var options = commandLineArgs([
    {
        name: "version",
        defaultOption: true
    },
    {
        name: "major",
        type: Boolean
    },
    {
        name: "minor",
        type: Boolean
    },
    {
        name: "patch",
        type: Boolean
    },
    {
        name: "prerelease",
        type: function(input) {
            if (!input || input === "true") {
                return true;
            }
            var asNumber = Number(input);
            if (Number.isInteger(asNumber) && asNumber >= 0) {
                return asNumber;
            }
            throw new Error("Invalid --prerelease value, must be either true (default), or a non-negative integrer");
        }
    },
    {
        name: "json",
        type: Boolean
    }
]);
if (!options.version || typeof options.version !== "string") {
    console.error("Missing version");
    process.exit(1);
}
var showMajor = Boolean(options.major);
var showMinor = Boolean(options.minor);
var showPatch = Boolean(options.patch);
var showPrerelease = options.prerelease !== undefined;
var showJson = Boolean(options.json);
var showOptionsSet = [
    +showMajor,
    +showMinor,
    +showPatch,
    +showPrerelease,
    +showJson
].reduce(function(prev, cur) {
    return prev + cur;
}, 0);
if (showOptionsSet === 0) {
    console.error("One of the following must be provided: --major, --minor, --patch, --prerelease, --json");
    process.exit(1);
}
if (showOptionsSet > 1) {
    console.error("Only one of the following may be provided: --major, --minor, --patch, --prerelease, --json");
    process.exit(1);
}
var version = new SemVer(options.version);
if (showMajor) {
    console.log(version.major.toString());
} else if (showMinor) {
    console.log(version.major.toString());
} else if (showPatch) {
    console.log(version.patch.toString());
} else if (showPrerelease) {
    var _options_prerelease;
    if (((_options_prerelease = options.prerelease) !== null && _options_prerelease !== void 0 ? _options_prerelease : true) === true) {
        console.log(JSON.stringify(version.prerelease));
    } else if (version.prerelease.length > options.prerelease) {
        console.log(version.prerelease[options.prerelease].toString());
    }
} else if (showJson) {
    console.log(JSON.stringify({
        major: version.major,
        minor: version.minor,
        patch: version.patch,
        prerelease: version.prerelease
    }));
}


//# sourceMappingURL=index.mjs.map