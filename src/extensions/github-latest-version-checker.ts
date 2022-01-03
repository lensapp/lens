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

import { SemVer } from "semver";
import logger from "../common/logger";
import { DownloadFileOptions, downloadJson } from "../common/utils";
import type { LensExtensionManifest } from "./lens-extension";
import type { LensExtensionLatestVersionChecker } from "./lens-extension-latest-version-checker";

export class GitHubVersionChecker implements LensExtensionLatestVersionChecker {
  protected downloadJson;

  constructor(downloadJsonOverride?: (args: DownloadFileOptions) => any) {
    this.downloadJson = downloadJsonOverride || downloadJson;
  }

  public async getLatestVersion(manifest: LensExtensionManifest) {
    if (!manifest.homepage?.includes("https://github.com")) {
      return null;
    }

    const repo = manifest.homepage?.replace("https://github.com/", "");
    const registryUrl = `https://api.github.com/repos/${repo}/releases/latest`;
    const json = await this.getJson(registryUrl);

    if (!json || json.error || json.prerelease || !json.tag_name) {
      return null;
    }

    logger.debug(`Found new version (${json.tag_name}) from GitHub`);

    return {
      input: json.assets[0].browser_download_url,
      version: new SemVer(json.tag_name).version,
    };
  }

  protected async getJson(url: string) {
    const headers = {
      "user-agent": "Lens IDE",
    };

    const { promise } = this.downloadJson({ url, headers });
    const json = await promise.catch(() => {
      // do nothing
    });

    return json;
  }
}
