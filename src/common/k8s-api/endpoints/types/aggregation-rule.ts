/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector } from "../../kube-object";

export interface AggregationRule {
  clusterRoleSelectors?: LabelSelector;
}
