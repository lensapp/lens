/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A type for the possible versions that a helm release was made from
 */
export interface HelmChartVersion {
  repo: string;
  version: string;
}
