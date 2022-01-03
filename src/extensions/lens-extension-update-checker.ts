/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import _ from "lodash";
import { SemVer } from "semver";
import logger from "../common/logger";
import type { LensExtensionManifest } from "./lens-extension";
import type { LensExtensionLatestVersionChecker } from "./lens-extension-latest-version-checker";

export type LensExtensionAvailableUpdate = {
  input: string;
  version: string;
};


export class LensExtensionUpdateChecker {
  protected updateSources: {
    [key: string]: LensExtensionLatestVersionChecker;
  };

  constructor(updateSources: {
    [key: string]: LensExtensionLatestVersionChecker;
  }) {
    this.updateSources = updateSources;
  }

  public async run(manifest: LensExtensionManifest): Promise<LensExtensionAvailableUpdate|undefined> {
    const { name, version } = manifest;

    logger.debug(`Check update for extension ${name}`);

    const versions: LensExtensionAvailableUpdate[] = [];

    for(const checker of Object.values(this.updateSources)) {
      const latestVersionFromSource = await checker.getLatestVersion(manifest);

      if (latestVersionFromSource && this.isUpdate(version, latestVersionFromSource.version)) {
        versions.push(latestVersionFromSource);
      }
    }

    const latestVersion = this.getLatestVersion(versions);

    if (latestVersion) {
      logger.debug(`Found new version ${latestVersion}`);
    }

    return latestVersion;
  }

  private isUpdate(currentVersion: string, availableVersion: string) {
    return new SemVer(currentVersion, { loose: true, includePrerelease: true }).compare(availableVersion) === -1;
  }

  private getLatestVersion(versions: LensExtensionAvailableUpdate[]) {
    if (versions.length === 0) {
      return null;
    }

    return _.reduce(versions, (prev, curr) => {
      const previousVersion = new SemVer(prev.version, { loose: true, includePrerelease: true });
      const currentVersion  = new SemVer(curr.version, { loose: true, includePrerelease: true });

      return previousVersion.compareMain(currentVersion) === -1
        ? curr
        : prev;
    });
  }

}
