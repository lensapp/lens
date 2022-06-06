/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../helm-repo";
import type { RequestChannel } from "../utils/channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../utils/channel/request-channel-injection-token";

export type DeactivateHelmRepositoryChannel = RequestChannel<HelmRepo>;

const deactivateHelmRepositoryChannelInjectable = getInjectable({
  id: "deactivate-helm-repository-channel",

  instantiate: (): DeactivateHelmRepositoryChannel => ({
    id: "deactivate-helm-repository-channel",
  }),

  injectionToken: requestChannelInjectionToken,
});

export default deactivateHelmRepositoryChannelInjectable;
