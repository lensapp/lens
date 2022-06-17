/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
 
 interface ExtensionPreferenceItem extends RegisteredAppPreference {
   extension: LensRendererExtension;
 }
 
export const extensionPreferenceItemInjectionToken = getInjectionToken<ExtensionPreferenceItem>({
  id: "extension-preference-item-injection-token",
});
 
