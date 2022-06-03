/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { overrideMessagingFromMainToWindow } from "./override-messaging-from-main-to-window";
import { overrideMessagingFromWindowToMain } from "./override-messaging-from-window-to-main";
import { overrideRequestingFromWindowToMain } from "./override-requesting-from-window-to-main";

export const overrideChannels = (mainDi: DiContainer) => {
  const overrideMessagingFromMainToWindowForWindow = overrideMessagingFromMainToWindow(mainDi);
  const overrideMessagingFromWindowToForWindow = overrideMessagingFromWindowToMain(mainDi);
  const overrideRequestingFromWindowToMainForWindow = overrideRequestingFromWindowToMain(mainDi);

  return (windowDi: DiContainer) => {
    overrideMessagingFromMainToWindowForWindow(windowDi);
    overrideMessagingFromWindowToForWindow(windowDi);
    overrideRequestingFromWindowToMainForWindow(windowDi);
  };
};
