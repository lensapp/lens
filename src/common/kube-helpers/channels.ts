/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { Asyncify } from "type-fest";
import type { RequestChannelHandler } from "../../main/utils/channel/channel-listeners/listener-tokens";
import type { ClusterId } from "../cluster-types";
import type { AsyncResult } from "../utils/async-result";
import type { RequestChannel } from "../utils/channel/request-channel-listener-injection-token";

export interface KubectlApplyAllArgs {
  clusterId: ClusterId;
  resources: string[];
  extraArgs: string[];
}

export const kubectlApplyAllChannel: RequestChannel<KubectlApplyAllArgs, AsyncResult<string, string>> = {
  id: "kubectl-apply-all",
};

export type KubectlApplyAll = Asyncify<RequestChannelHandler<typeof kubectlApplyAllChannel>>;

export const kubectlApplyAllInjectionToken = getInjectionToken<KubectlApplyAll>({
  id: "kubectl-apply-all",
});

export interface KubectlDeleteAllArgs {
  clusterId: ClusterId;
  resources: string[];
  extraArgs: string[];
}

export const kubectlDeleteAllChannel: RequestChannel<KubectlDeleteAllArgs, AsyncResult<string, string>> = {
  id: "kubectl-delete-all",
};

export type KubectlDeleteAll = Asyncify<RequestChannelHandler<typeof kubectlDeleteAllChannel>>;

export const kubectlDeleteAllInjectionToken = getInjectionToken<KubectlDeleteAll>({
  id: "kubectl-delete-all",
});
