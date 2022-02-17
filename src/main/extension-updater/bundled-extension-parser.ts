/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import logger from "../logger";

type Extensions = Record<string, string>;

interface ExtensionList {
  release: Extensions,
  available: Extensions
}

export class BundledExtensionParser {
  constructor(private lensVersion: string, private url: string) {
  }

  get releaseJsonUrl() {
    return `${this.url}/${this.lensVersion}.json`;
  }

  get availableJsonUrl() {
    return `${this.url}/versions.json`;
  }

  fetchJsonList(path: string): Promise<Extensions> {
    return fetch(path, { method: "GET" }).then(response => {
      if (response.ok) {
        return response.json();
      }

      return {};
    }).catch(error => {
      logger.error(`[EXTENSION-PARSER]: Failed to download and parse extension list: ${error}`);

      return {};
    });
  }

  public async getExtensionLists(): Promise<ExtensionList> {
    if (!this.url) {
      return {
        release: {},
        available: {},
      };
    }

    const release = await this.fetchJsonList(this.releaseJsonUrl);
    const available = await this.fetchJsonList(this.availableJsonUrl);

    return {
      release,
      available,
    };
  }
}
