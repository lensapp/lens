/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { initIpcMainHandlers } from "./init-ipc-main-handlers";
import getAppMenuItemsInjectable from "../../menu/get-app-menu-items.injectable";

const initIpcMainHandlersInjectable = getInjectable({
  id: "init-ipc-main-handlers",

  instantiate: (di) => initIpcMainHandlers({
    getAppMenuItems: () => di.inject(getAppMenuItemsInjectable)(),
    directoryForLensLocalStorage: di.inject(directoryForLensLocalStorageInjectable),
  }),
});

export default initIpcMainHandlersInjectable;
