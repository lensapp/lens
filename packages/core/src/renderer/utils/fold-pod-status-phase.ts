/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { PodStatusPhase } from "../../common/k8s-api/endpoints";

export const foldPodStatusPhase = (previous: "failed" | "pending" | "running", current: PodStatusPhase): "failed" | "pending" | "running" => {
  if (previous === "failed" || current === PodStatusPhase.FAILED) {
    return "failed";
  }

  if (previous === "pending" || current === PodStatusPhase.PENDING) {
    return "pending";
  }

  return "running";
};
