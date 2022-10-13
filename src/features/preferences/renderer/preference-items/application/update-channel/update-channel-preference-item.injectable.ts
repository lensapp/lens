/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { UpdateChannel } from "./update-channel";

const updateChannelPreferenceItemInjectable = getInjectable({
  id: "update-channel-preference-item",

  instantiate: () => ({
    kind: "item" as const,
    id: "update-channel",
    parentId: "application-page",
    orderNumber: 50,
    Component: UpdateChannel,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default updateChannelPreferenceItemInjectable;
