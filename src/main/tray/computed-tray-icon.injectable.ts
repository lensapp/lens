/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import AwaitLock from "await-lock";
import type { NativeImage, Tray } from "electron";
import { comparer, reaction } from "mobx";
import loggerInjectable from "../../common/logger.injectable";
import type { Disposer } from "../../common/utils";
import { getOrInsertWithAsync, HashMap } from "../../common/utils";
import updateAvailableInjectable from "../app-updater/update-available.injectable";
import useDarkColorsInjectable from "../electron/use-dark-colors.injectable";
import { createTrayIcon } from "./create-tray-icon";

export interface ComputedTrayIcon {
  getCurrent(): Promise<NativeImage>;
  subscribe(tray: Tray): Disposer;
}

interface NativeImageCacheKey {
  updateAvailable: boolean;
  useDarkColors: boolean;
}

const computedTrayIconInjectable = getInjectable({
  id: "computed-tray-icon",
  instantiate: (di): ComputedTrayIcon => {
    const useDarkColors = di.inject(useDarkColorsInjectable);
    const updateAvailable = di.inject(updateAvailableInjectable);
    const logger = di.inject(loggerInjectable);
    const lock = new AwaitLock();
    const cache = new HashMap<NativeImageCacheKey, NativeImage>(
      (key) => `${key.updateAvailable ? "updateAvailable" : ""}:${key.useDarkColors ? "shouldUseDarkColors" : ""}`,
    );

    const computedCurrent = (key: NativeImageCacheKey) => getOrInsertWithAsync(cache, key, () => createTrayIcon({
      size: 16,
      ...key,
    }));

    return {
      getCurrent: () => computedCurrent({
        updateAvailable: updateAvailable.get(),
        useDarkColors: useDarkColors.get(),
      }),
      subscribe: (tray) => reaction(
        () => ({
          updateAvailable: updateAvailable.get(),
          useDarkColors: useDarkColors.get(),
        }),
        (key) => {
          lock.acquireAsync()
            .then(() => computedCurrent(key))
            .then(img => tray.setImage(img))
            .catch((error) => logger.warn("[TRAY]: failed to update image after changing state", { key, error }))
            .finally(() => lock.release());
        },
        {
          equals: (a, b) => comparer.structural(a, b),
        },
      ),
    };
  },
});

export default computedTrayIconInjectable;
