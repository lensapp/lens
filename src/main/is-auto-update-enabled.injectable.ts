/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isPublishConfigured } from "../common/vars";
import { autoUpdater } from "electron-updater";

const isAutoUpdateEnabledInjectable = getInjectable({
  id: "is-auto-update-enabled",

  instantiate: () => () => {
    return autoUpdater.isUpdaterActive() && isPublishConfigured;
  },

  causesSideEffects: true,
});

export default isAutoUpdateEnabledInjectable;
