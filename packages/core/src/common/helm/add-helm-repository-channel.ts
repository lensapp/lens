/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { HelmRepo } from "./helm-repo";
import type { AsyncResult } from "../utils/async-result";
import type { RequestChannel } from "../utils/channel/request-channel-listener-injection-token";

export type AddHelmRepositoryChannel = RequestChannel<HelmRepo, AsyncResult<void, string>>;

export const addHelmRepositoryChannel: AddHelmRepositoryChannel = {
  id: "add-helm-repository-channel",
};
