/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
    if (!manifest.homepage?.startsWith("https://github.com")) {
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
