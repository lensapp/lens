/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ItemObject } from "@k8slens/list-layout";
import type { HelmReleaseData } from "../../../features/helm-releases/common/channels";

export interface HelmReleaseUpdateDetails {
  log: string;
  release: HelmReleaseData;
}

export interface HelmRelease extends ItemObject {
  appVersion: string;
  name: string;
  namespace: string;
  chart: string;
  status: string;
  updated: string;
  revision: string;
  getNs: () => string;
  getChart: (withVersion?: boolean) => string;
  getRevision: () => number;
  getStatus: () => string;
  getVersion: () => string;
  getUpdated: (humanize?: boolean, compact?: boolean) => string | number;
}
