/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ipcMainOn } from "../../../../common/ipc";
import { IpcRendererNavigationEvents } from "../../../../renderer/navigation/events";
import { onRootFrameRenderInjectionToken } from "../../on-root-frame-render/on-root-frame-render-injection-token";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import { runManyFor } from "../../run-many-for";

const setupListenerForRootFrameRenderingInjectable = getInjectable({
  id: "setup-listener-for-root-frame-rendering",

  instantiate: (di) => {
    const runMany = runManyFor(di);

    const runOnRootFrameRender = runMany(
      onRootFrameRenderInjectionToken,
    );

    return {
      run: () => {
        ipcMainOn(IpcRendererNavigationEvents.LOADED, async () => {
          await runOnRootFrameRender();
        });
      },
    };
  },

  // Direct usage of IPC
  causesSideEffects: true,

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupListenerForRootFrameRenderingInjectable;
