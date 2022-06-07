/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../helm-repo";
import type { RequestChannel } from "../utils/channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../utils/channel/request-channel-injection-token";
import type { AsyncResult } from "../utils/async-result";

export type ActivateHelmRepositoryChannel = RequestChannel<HelmRepo, AsyncResult<string>>;

const activateHelmRepositoryChannelInjectable = getInjectable({
  id: "activate-helm-repository-channel",

  instantiate: (): ActivateHelmRepositoryChannel => ({
    id: "activate-helm-repository-channel",
  }),

  injectionToken: requestChannelInjectionToken,
});

export default activateHelmRepositoryChannelInjectable;
