/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import { beforeFrameStartsInjectionToken } from "../../../before-frame-starts/before-frame-starts-injection-token";
import ipcRendererInjectable from "../../../utils/channel/ipc-renderer.injectable";
import topBarStateInjectable from "./state.injectable";

// TODO: replace with a SyncBox
const startTopbarStateSyncInjectable = getInjectable({
  id: "start-topbar-state-sync",
  instantiate: (di) => {
    const state = di.inject(topBarStateInjectable);
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return {
      id: "start-topbar-state-sync",
      run: () => {
        ipcRenderer.on("history:can-go-back", action((event, canGoBack: boolean) => {
          state.prevEnabled = canGoBack;
        }));

        ipcRenderer.on("history:can-go-forward", action((event, canGoForward: boolean) => {
          state.nextEnabled = canGoForward;
        }));
      },
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
  causesSideEffects: true,
});

export default startTopbarStateSyncInjectable;
