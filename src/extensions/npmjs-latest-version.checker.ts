/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import _ from "lodash";
import { SemVer } from "semver";
import URLParse from "url-parse";
import { DownloadFileOptions, downloadJson } from "../common/utils/";
import type { LensExtensionManifest } from "./lens-extension";
import type { LensExtensionLatestVersionChecker } from "./lens-extension-latest-version-checker";

export class NpmJsVersionChecker implements LensExtensionLatestVersionChecker {
  protected downloadJson;

  constructor(downloadJsonOverride?: (args: DownloadFileOptions) => any) {
    this.downloadJson = downloadJsonOverride || downloadJson;
  }

  public async getLatestVersion(manifest: LensExtensionManifest) {
    const { name } = manifest;
    const registryUrl = new URLParse("https://registry.npmjs.com").set("pathname", name).toString();
    const json = await this.getJson(registryUrl);

    if (!json || json.error || typeof json.versions !== "object" || !json.versions) {
      return null;
    }

    // TODO refactor into helpoer method
    const versions = Object.keys(json.versions)
      .map(version => new SemVer(version, { loose: true, includePrerelease: true }))
      // ignore pre-releases for auto picking the version
      .filter(version => version.prerelease.length === 0);

    const version = _.reduce(versions, (prev, curr) => (
      prev.compareMain(curr) === -1
        ? curr
        : prev
    )).format();

    return {
      input: name,
      version,
    };
  }

  protected async getJson(url: string) {
    const { promise } = this.downloadJson({ url });
    const json = await promise.catch(() => {
      // do nothing
    });

    return json;
  }
}
