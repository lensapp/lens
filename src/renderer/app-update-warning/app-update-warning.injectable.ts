/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import sessionStorageInjectable from "../utils/session-storage.injectable";
import { AppUpdateWarning } from "./app-update-warning";

const appUpdateWarningInjectable = getInjectable({
  id: "app-update-warning",

  instantiate: (di) => {
    return AppUpdateWarning.createInstance({
      ipcRenderer: di.inject(ipcRendererInjectable),
      sessionStorage: di.inject(sessionStorageInjectable),
    });
  },
});

export default appUpdateWarningInjectable;
