/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ItemObject } from "../../item.store";
import type { HelmReleaseDetails } from "./helm-releases.api/request-details.injectable";

export interface HelmReleaseUpdateDetails {
  log: string;
  release: HelmReleaseDetails;
}

export interface HelmReleaseDto {
  appVersion: string;
  name: string;
  namespace: string;
  chart: string;
  status: string;
  updated: string;
  revision: string;
}

export interface HelmRelease extends HelmReleaseDto, ItemObject {
  getNs: () => string;
  getChart: (withVersion?: boolean) => string;
  getRevision: () => number;
  getStatus: () => string;
  getVersion: () => string;
  getUpdated: (humanize?: boolean, compact?: boolean) => string | number;
  getRepo: () => Promise<string>;
}
