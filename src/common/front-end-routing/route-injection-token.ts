/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";

export const routeInjectionToken = getInjectionToken<Route<unknown>>({
  id: "route-injection-token",
});

export interface Route<TParameter = void> {
  path: string;
  clusterFrame: boolean;
  isEnabled: IComputedValue<boolean>;
  extension?: LensRendererExtension;

  readonly parameterSignature?: TParameter;
}
