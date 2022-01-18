/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import electronMenuItemsInjectable from "../../menu/electron-menu-items.injectable";
import directoryForLensLocalStorageInjectable
  from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { initIpcMainHandlers } from "./init-ipc-main-handlers";

const initIpcMainHandlersInjectable = getInjectable({
  instantiate: (di) => initIpcMainHandlers({
    electronMenuItems: di.inject(electronMenuItemsInjectable),
    directoryForLensLocalStorage: di.inject(directoryForLensLocalStorageInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default initIpcMainHandlersInjectable;
