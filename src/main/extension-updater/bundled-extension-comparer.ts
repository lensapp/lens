/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import semverValid from "semver/functions/valid";
import semverGt from "semver/functions/gt";

type Extensions = Record<string, string>;

export type ExtensionToDownload = {
  name: string;
  version: string;
  downloadUrl: string;
};

export class BundledExtensionComparer {
  private releaseExtensions: Map<string, string>;
  private availableExtensions: Map<string, string>;

  constructor(releaseExtensions: Extensions, availableExtensions: Extensions, private downloadUrl: string) {
    this.releaseExtensions = new Map(Object.entries(releaseExtensions));
    this.availableExtensions = new Map(Object.entries(availableExtensions));
  }

  private getDownloadUrl(name: string, version: string) {
    return `${this.downloadUrl}/${name}-${version}.tgz`;
  }

  public getExtensionsToDownload(): ExtensionToDownload[] {
    const extensions: ExtensionToDownload[] = [];

    for (const [name, version] of this.availableExtensions) {
      if (!semverValid(this.releaseExtensions.get(name))) {
        continue;
      }

      if (semverGt(version, this.releaseExtensions.get(name))) {
        extensions.push({
          name,
          version,
          downloadUrl: this.getDownloadUrl(name, version),
        });
      }
    }

    return extensions;
  }
}
