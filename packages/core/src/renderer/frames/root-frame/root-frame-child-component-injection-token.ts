/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";

export interface RootFrameChildComponent {
  id: string;
  Component: React.ElementType;
  shouldRender: IComputedValue<boolean>;
}

export const rootFrameChildComponentInjectionToken = getInjectionToken<RootFrameChildComponent>({
  id: "root-frame-child-component",
});
