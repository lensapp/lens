/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestChannel } from "../utils/channel/request-channel-injection-token";
import type { HelmRepo } from "../helm-repo";
import { requestChannelInjectionToken } from "../utils/channel/request-channel-injection-token";

export type GetHelmRepositoriesChannel = RequestChannel<void, HelmRepo[]>;

const getActiveHelmRepositoriesChannelInjectable = getInjectable({
  id: "get-active-helm-repositories-channel",

  instantiate: (): GetHelmRepositoriesChannel => ({
    id: "get-helm-active-list-repositories",
  }),

  injectionToken: requestChannelInjectionToken,
});

export default getActiveHelmRepositoriesChannelInjectable;
