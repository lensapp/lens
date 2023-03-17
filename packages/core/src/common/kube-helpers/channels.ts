/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterId } from "../cluster-types";
import type { AsyncResult, Result } from "@k8slens/utilities";
import { getRequestChannel } from "@k8slens/messaging";

export interface KubectlApplyAllArgs {
  clusterId: ClusterId;
  resources: string[];
  extraArgs: string[];
}

export const kubectlApplyAllChannel = getRequestChannel<
  KubectlApplyAllArgs,
  Result<string, string>
>("kubectl-apply-all");

export type KubectlApplyAll = (req: KubectlApplyAllArgs) => AsyncResult<string, string>;

export const kubectlApplyAllInjectionToken = getInjectionToken<KubectlApplyAll>({
  id: "kubectl-apply-all",
});

export interface KubectlDeleteAllArgs {
  clusterId: ClusterId;
  resources: string[];
  extraArgs: string[];
}

export const kubectlDeleteAllChannel = getRequestChannel<
  KubectlDeleteAllArgs,
  Result<string, string>
>("kubectl-delete-all");

export type KubectlDeleteAll = (req: KubectlDeleteAllArgs) => AsyncResult<string, string>;

export const kubectlDeleteAllInjectionToken = getInjectionToken<KubectlDeleteAll>({
  id: "kubectl-delete-all",
});
