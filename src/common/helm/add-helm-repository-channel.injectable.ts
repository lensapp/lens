/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "./helm-repo";
import type { RequestChannel } from "../utils/channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../utils/channel/request-channel-injection-token";
import type { AsyncResult } from "../utils/async-result";

export type AddHelmRepositoryChannel = RequestChannel<HelmRepo, AsyncResult<string>>;

const addHelmRepositoryChannelInjectable = getInjectable({
  id: "add-helm-repository-channel",

  instantiate: (): AddHelmRepositoryChannel => ({
    id: "add-helm-repository-channel",
  }),

  injectionToken: requestChannelInjectionToken,
});

export default addHelmRepositoryChannelInjectable;
