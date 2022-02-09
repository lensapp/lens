/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronMenuItemsInjectable from "../../menu/electron-menu-items.injectable";
import directoryForLensLocalStorageInjectable
  from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { initIpcMainHandlers } from "./init-ipc-main-handlers";

const initIpcMainHandlersInjectable = getInjectable({
  id: "init-ipc-main-handlers",

  instantiate: (di) => initIpcMainHandlers({
    electronMenuItems: di.inject(electronMenuItemsInjectable),
    directoryForLensLocalStorage: di.inject(directoryForLensLocalStorageInjectable),
  }),
});

export default initIpcMainHandlersInjectable;
