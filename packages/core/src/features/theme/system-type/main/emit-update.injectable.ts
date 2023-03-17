/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import type { SystemThemeType } from "../common/channels";
import { systemThemeTypeUpdateChannel } from "../common/channels";

const emitSystemThemeTypeUpdateInjectable = getInjectable({
  id: "emit-system-theme-type-update",
  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (type: SystemThemeType) => sendMessageToChannel(systemThemeTypeUpdateChannel, type);
  },
});

export default emitSystemThemeTypeUpdateInjectable;
