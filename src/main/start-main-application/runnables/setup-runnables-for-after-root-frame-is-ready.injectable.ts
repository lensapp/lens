/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ipcMainOn } from "../../../common/ipc";
import { IpcRendererNavigationEvents } from "../../../renderer/navigation/events";
import { afterRootFrameIsReadyInjectionToken } from "../runnable-tokens/after-root-frame-is-ready-injection-token";
import { runManyFor } from "../../../common/runnable/run-many-for";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";

const setupRunnablesForAfterRootFrameIsReadyInjectable = getInjectable({
  id: "setup-runnables-for-after-root-frame-is-ready",

  instantiate: (di) => {
    const runMany = runManyFor(di);

    const runRunnablesAfterRootFrameIsReady = runMany(
      afterRootFrameIsReadyInjectionToken,
    );

    return {
      run: () => {
        ipcMainOn(IpcRendererNavigationEvents.LOADED, async () => {
          await runRunnablesAfterRootFrameIsReady();
        });
      },
    };
  },

  // Direct usage of IPC
  causesSideEffects: true,

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupRunnablesForAfterRootFrameIsReadyInjectable;
