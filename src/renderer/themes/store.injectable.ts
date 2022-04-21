/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import ipcRendererInjectable from "../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import { ThemeStore } from "./store";

const themeStoreInjectable = getInjectable({
  id: "theme-store",

  instantiate: (di) => new ThemeStore({
    ipcRenderer: di.inject(ipcRendererInjectable),
    userStore: di.inject(userStoreInjectable),
  }),

  causesSideEffects: true,
});

export default themeStoreInjectable;
