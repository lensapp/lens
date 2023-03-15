/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { ChannelRequester } from "../../../../common/utils/channel/request-from-channel-injection-token";
import type { activateClusterChannel } from "./channels";

export type RequestClusterActivation = ChannelRequester<typeof activateClusterChannel>;

export const requestClusterActivationInjectionToken = getInjectionToken<RequestClusterActivation>({
  id: "request-cluster-activation-token",
});
