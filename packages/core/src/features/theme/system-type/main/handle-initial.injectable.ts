/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import operatingSystemThemeInjectable from "../../../../main/theme/operating-system-theme.injectable";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import { initialSystemThemeTypeChannel } from "../common/channels";

const initialSystemThemeTypeHandler = getRequestChannelListenerInjectable({
  id: "initial-system-theme-type-listener",
  channel: initialSystemThemeTypeChannel,
  getHandler: (di) => {
    const operatingSystemTheme = di.inject(operatingSystemThemeInjectable);

    return () => operatingSystemTheme.get();
  },
});

export default initialSystemThemeTypeHandler;
