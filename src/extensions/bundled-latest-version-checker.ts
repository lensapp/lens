/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { SemVer } from "semver";
import logger from "../common/logger";
import { extensionUpdateUrl } from "../common/vars";
import { DownloadFileOptions, downloadJson } from "../renderer/utils";
import type { LensExtensionManifest } from "./lens-extension";
import type { LensExtensionLatestVersionChecker } from "./lens-extension-latest-version-checker";

type ExtensionName = string;
type ExtensionVersion = string;
type Versions = Record<ExtensionName, ExtensionVersion>;

export class BundledVersionChecker implements LensExtensionLatestVersionChecker {
  protected downloadJson;

  constructor(downloadJsonOverride?: (args: DownloadFileOptions) => any) {
    this.downloadJson = downloadJsonOverride || downloadJson;
  }

  public async getLatestVersion(manifest: LensExtensionManifest, isBundled?: boolean) {
    if (!isBundled) {
      return null;
    }

    const json = await this.getJson(`${extensionUpdateUrl}/versions.json`);

    if (!json || json.error || !json[manifest.name]) {
      logger.info(`[EXTENSION-VERSION-CHECKER]: No version found for ${manifest.name}.`);
      return null;
    }

    const version = json[manifest.name];

    return {
      input: `${extensionUpdateUrl}/${manifest.name}-${version}.tgz`,
      version: new SemVer(version).version
    }
  }

  protected async getJson(url: string): Promise<Versions> {
    const { promise } = this.downloadJson({ url });
    const json = await promise.catch(() => {
      // do nothing
    });

    return json;
  }
}