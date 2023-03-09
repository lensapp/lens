/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { WorkloadStatus } from "../components/+workloads-overview/overview-workload-status";
import type { WorkloadStatusPhase } from "../components/+workloads-overview/workloads/workload-injection-token";

export const foldWorkloadStatusPhase = (previous: WorkloadStatus, current: WorkloadStatusPhase): WorkloadStatus => {
  if (previous === "failed" || current === "Failed") {
    return "failed";
  }

  if (previous === "evicted" || current === "Evicted") {
    return "evicted";
  }

  if (previous === "pending" || current === "Pending") {
    return "pending";
  }

  if (previous === "suspended" || current === "Suspended") {
    return "suspended";
  }

  if (previous === "running" || current === "Running") {
    return "running";
  }

  if (previous === "scheduled" || current === "Scheduled") {
    return "scheduled";
  }

  if (previous === "succeeded" || current === "Succeeded") {
    return "succeeded";
  }

  if (previous === "terminated" || current === "Terminated") {
    return "terminated";
  }

  return "unknown";
};
