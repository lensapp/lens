/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { getStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import { setNativeThemeChannel } from "../../../common/ipc/native-theme";
import operatingSystemThemeInjectable from "../operating-system-theme.injectable";
import broadcastMessageInjectable from "../../../common/ipc/broadcast-message.injectable";

const broadcastThemeChangeInjectable = getInjectable({
  id: "broadcast-theme-change",

  instantiate: (di) => {
    const currentTheme = di.inject(operatingSystemThemeInjectable);
    const broadcastMessage = di.inject(broadcastMessageInjectable);

    return getStartableStoppable("broadcast-theme-change", () =>
      reaction(() => currentTheme.get(), (theme) => {
        broadcastMessage(setNativeThemeChannel, theme);
      }),
    );
  },
});

export default broadcastThemeChangeInjectable;
