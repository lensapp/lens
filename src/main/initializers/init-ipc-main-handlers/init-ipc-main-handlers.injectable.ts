/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { initIpcMainHandlers } from "./init-ipc-main-handlers";
import getAbsolutePathInjectable from "../../../common/path/get-absolute-path.injectable";
import applicationMenuItemsInjectable from "../../menu/application-menu-items.injectable";

const initIpcMainHandlersInjectable = getInjectable({
  id: "init-ipc-main-handlers",

  instantiate: (di) => initIpcMainHandlers({
    applicationMenuItems: di.inject(applicationMenuItemsInjectable),
    directoryForLensLocalStorage: di.inject(directoryForLensLocalStorageInjectable),
    getAbsolutePath: di.inject(getAbsolutePathInjectable),
  }),
});

export default initIpcMainHandlersInjectable;
