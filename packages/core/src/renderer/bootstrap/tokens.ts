/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { FunctionComponent } from "react";

export interface InitializeApp {
  init: (unmountRoot: () => void) => Promise<void>;
  isActive: boolean;
}

export const initializeAppInjectionToken = getInjectionToken<InitializeApp>({
  id: "initialize-app-token",
});

export interface RootComponent {
  Component: FunctionComponent<{}>;
  isActive: boolean;
}

export const rootComponentInjectionToken = getInjectionToken<RootComponent>({
  id: "root-component-token",
});
