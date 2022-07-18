/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ItemObject } from "../../common/item.store";

export interface RawHelmRelease {
  appVersion: string;
  name: string;
  namespace: string;
  chart: string;
  status: string;
  updated: string;
  revision: string;
}

export interface HelmRelease extends RawHelmRelease, ItemObject {
  getNs: () => string;
  getChart: (withVersion?: boolean) => string;
  getRevision: () => number;
  getStatus: () => string;
  getVersion: () => string;
  getUpdated: (humanize?: boolean, compact?: boolean) => string | number;
  getRepo: () => Promise<string>;
}
