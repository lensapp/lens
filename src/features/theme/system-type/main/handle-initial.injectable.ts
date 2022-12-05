/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import operatingSystemThemeInjectable from "../../../../main/theme/operating-system-theme.injectable";
import { getRequestChannelListenerInjectable } from "../../../../main/utils/channel/channel-listeners/listener-tokens";
import { initialSystemThemeTypeChannel } from "../common/channels";

const initialSystemThemeTypeHandler = getRequestChannelListenerInjectable({
  channel: initialSystemThemeTypeChannel,
  handler: (di) => {
    const operatingSystemTheme = di.inject(operatingSystemThemeInjectable);

    return () => operatingSystemTheme.get();
  },
});

export default initialSystemThemeTypeHandler;
