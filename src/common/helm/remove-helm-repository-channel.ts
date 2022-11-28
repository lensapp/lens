/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncResult } from "../utils/async-result";
import type { RequestChannel } from "../utils/channel/request-channel-listener-injection-token";
import type { HelmRepo } from "./helm-repo";

export type RemoveHelmRepositoryChannel = RequestChannel<HelmRepo, AsyncResult<void, string>>;

export const removeHelmRepositoryChannel: RemoveHelmRepositoryChannel = {
  id: "remove-helm-repository-channel",
};
