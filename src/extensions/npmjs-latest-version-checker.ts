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
import URLParse from "url-parse";
import { DownloadFileOptions, downloadJson } from "../common/utils";
import type { LensExtensionManifest } from "./lens-extension";
import type { LensExtensionLatestVersionChecker } from "./lens-extension-latest-version-checker";

export class NpmJsVersionChecker implements LensExtensionLatestVersionChecker {
  protected downloadJson;

  constructor(downloadJsonOverride?: (args: DownloadFileOptions) => any) {
    this.downloadJson = downloadJsonOverride || downloadJson;
  }

  public async getLatestVersion(manifest: LensExtensionManifest, isBundled: boolean) {
    if (!isBundled) {
      return null;
    }

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
