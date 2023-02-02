/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { rootComponentInjectionToken } from "../../bootstrap/tokens";
import { RootFrame } from "./root-frame";

const rootFrameRootComponentInjectable = getInjectable({
  id: "root-frame-root-component",
  instantiate: () => ({
    Component: RootFrame,
    isActive: process.isMainFrame,
  }),
  injectionToken: rootComponentInjectionToken,
});

export default rootFrameRootComponentInjectable;
