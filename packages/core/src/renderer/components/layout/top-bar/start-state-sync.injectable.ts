/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import { beforeFrameStartsSecondInjectionToken } from "../../../before-frame-starts/tokens";
import ipcRendererInjectable from "../../../utils/channel/ipc-renderer.injectable";
import topBarStateInjectable from "./state.injectable";

// TODO: replace with a SyncBox
const startTopbarStateSyncInjectable = getInjectable({
  id: "start-topbar-state-sync",
  instantiate: (di) => ({
    run: () => {
      const state = di.inject(topBarStateInjectable);
      const ipcRenderer = di.inject(ipcRendererInjectable);

      ipcRenderer.on("history:can-go-back", action((event, canGoBack: boolean) => {
        state.prevEnabled = canGoBack;
      }));

      ipcRenderer.on("history:can-go-forward", action((event, canGoForward: boolean) => {
        state.nextEnabled = canGoForward;
      }));
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
  causesSideEffects: true,
});

export default startTopbarStateSyncInjectable;
