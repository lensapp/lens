/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import appPublishDateInjectable from "./app-publish-date.injectable";
import { AppUpdateWarning } from "./app-update-warning";

const appUpdateWarningInjectable = getInjectable({
  id: "app-update-warning",

  instantiate: (di) => {
    AppUpdateWarning.resetInstance();

    return AppUpdateWarning.createInstance({
      releaseDate: di.inject(appPublishDateInjectable),
      ipcRenderer: di.inject(ipcRendererInjectable),
    });
  },
});

export default appUpdateWarningInjectable;
