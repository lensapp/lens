/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "./helm-repo";
import type { RequestChannel } from "../utils/channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../utils/channel/request-channel-injection-token";

export type RemoveHelmRepositoryChannel = RequestChannel<HelmRepo>;

const removeHelmRepositoryChannelInjectable = getInjectable({
  id: "remove-helm-repository-channel",

  instantiate: (): RemoveHelmRepositoryChannel => ({
    id: "remove-helm-repository-channel",
  }),

  injectionToken: requestChannelInjectionToken,
});

export default removeHelmRepositoryChannelInjectable;
