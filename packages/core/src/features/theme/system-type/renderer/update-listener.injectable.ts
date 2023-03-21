/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import systemThemeConfigurationInjectable from "../../../../renderer/themes/system-theme.injectable";
import { systemThemeTypeUpdateChannel } from "../common/channels";

const systemThemeTypeUpdateListenerInjectable = getMessageChannelListenerInjectable({
  channel: systemThemeTypeUpdateChannel,
  id: "main",
  getHandler: (di) => {
    const systemThemeConfiguration = di.inject(systemThemeConfigurationInjectable);

    return (type) => systemThemeConfiguration.set(type);
  },
});

export default systemThemeTypeUpdateListenerInjectable;
