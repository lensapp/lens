/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import ipcRendererInjectable from "../utils/channel/ipc-renderer.injectable";
import { ThemeStore } from "./store";

const themeStoreInjectable = getInjectable({
  id: "theme-store",

  instantiate: (di) => new ThemeStore({
    ipcRenderer: di.inject(ipcRendererInjectable),
    userStore: di.inject(userStoreInjectable),
    logger: di.inject(loggerInjectable),
  }),
});

export default themeStoreInjectable;
