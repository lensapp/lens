/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import type { SendToViewArgs } from "../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";
import { overrideMessagingFromMainToWindow } from "./override-messaging-from-main-to-window";
import { overrideMessagingFromWindowToMain } from "./override-messaging-from-window-to-main";
import { overrideRequestingFromWindowToMain } from "./override-requesting-from-window-to-main";

export interface OverrideChannels {
  overrideForWindow: (windowDi: DiContainer, windowId: string) => void;
  sendToWindow: (windowId: string, args: SendToViewArgs) => void;
}

export const overrideChannels = (mainDi: DiContainer): OverrideChannels => {
  const { overrideEnlistForWindow, sendToWindow } = overrideMessagingFromMainToWindow();
  const overrideMessagingFromWindowToForWindow = overrideMessagingFromWindowToMain(mainDi);
  const overrideRequestingFromWindowToMainForWindow = overrideRequestingFromWindowToMain(mainDi);

  return {
    overrideForWindow: (windowDi, windowId) => {
      overrideEnlistForWindow(windowDi, windowId);
      overrideMessagingFromWindowToForWindow(windowDi);
      overrideRequestingFromWindowToMainForWindow(windowDi);
    },
    sendToWindow,
  };
};
