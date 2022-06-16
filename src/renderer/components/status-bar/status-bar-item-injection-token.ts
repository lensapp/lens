/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type React from "react";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";

export interface StatusBarItem {
  component: React.ComponentType<any>;
  position: "left" | "right";
  visible: IComputedValue<boolean>;

  extension?: LensRendererExtension;
}

export const statusBarItemInjectionToken = getInjectionToken<StatusBarItem>({
  id: "status-bar-item",
});
