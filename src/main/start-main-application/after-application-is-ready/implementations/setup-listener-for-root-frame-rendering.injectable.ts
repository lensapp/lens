/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ipcMainOn } from "../../../../common/ipc";
import { IpcRendererNavigationEvents } from "../../../../renderer/navigation/events";
import { afterRootFrameIsReadyInjectionToken } from "../../after-root-frame-is-ready/after-root-frame-is-ready-injection-token";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import { runManyFor } from "../../run-many-for";

const setupListenerForRootFrameRenderingInjectable = getInjectable({
  id: "setup-listener-for-root-frame-rendering",

  instantiate: (di) => {
    const runMany = runManyFor(di);

    const runAfterRootFrameIsReady = runMany(
      afterRootFrameIsReadyInjectionToken,
    );

    return {
      run: () => {
        ipcMainOn(IpcRendererNavigationEvents.LOADED, async () => {
          await runAfterRootFrameIsReady();
        });
      },
    };
  },

  // Direct usage of IPC
  causesSideEffects: true,

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupListenerForRootFrameRenderingInjectable;
