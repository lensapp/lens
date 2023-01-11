/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";

export interface NavigateToUrlOptions {
  withoutAffectingBackButton?: boolean;
  forceRootFrame?: boolean;
}

export type NavigateToUrl = (url: string, options?: NavigateToUrlOptions) => void;

export const navigateToUrlInjectionToken = getInjectionToken<NavigateToUrl>(
  { id: "navigate-to-url-injection-token" },
);
