/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { find, sortBy } from "lodash/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { trayIconInjectionToken } from "./tray-icon-injection-token";

const trayIconInjectable = getInjectable({
  id: "tray-icon",

  instantiate: (di) => {
    const availableIcons = di.injectMany(trayIconInjectionToken);

    return computed(() => {
      const mostPrioritizedIcon = pipeline(
        availableIcons,
        sortBy((icon) => icon.priority),
        find((icon) => icon.shouldBeShown.get()),
      );

      if (!mostPrioritizedIcon) {
        throw new Error("There should always be tray icon which is shown.");
      }

      return mostPrioritizedIcon;
    });
  },
});

export default trayIconInjectable;
