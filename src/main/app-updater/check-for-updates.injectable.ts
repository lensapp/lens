/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoUpdater } from "electron-updater";
import { broadcastMessage, AutoUpdateChecking, AutoUpdateLogPrefix } from "../../common/ipc";
import type { UserPreferencesStore } from "../../common/user-preferences";
import logger from "../logger";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../common/utils";
import userPreferencesStoreInjectable from "../../common/user-preferences/store.injectable";

interface Dependencies {
  userStore: UserPreferencesStore;
}

async function checkForUpdates({ userStore }: Dependencies): Promise<void> {
  try {
    logger.info(`📡 Checking for app updates`);

    autoUpdater.channel = userStore.updateChannel;
    autoUpdater.allowDowngrade = userStore.isAllowedToDowngrade;
    broadcastMessage(AutoUpdateChecking);
    await autoUpdater.checkForUpdates();
  } catch (error) {
    logger.error(`${AutoUpdateLogPrefix}: failed with an error`, error);
  }
}

const checkForUpdatesInjectable = getInjectable({
  instantiate: (di) => bind(checkForUpdates, null, {
    userStore: di.inject(userPreferencesStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default checkForUpdatesInjectable;

