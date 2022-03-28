/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeJsonApiData } from "./kube-json-api";
import type { KubeStatusData } from "./kube-object";

export type IKubeWatchEvent<T extends KubeJsonApiData> = {
  type: "ADDED" | "MODIFIED" | "DELETED";
  object: T;
} | {
  type: "ERROR";
  object: KubeStatusData;
};

