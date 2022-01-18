/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
