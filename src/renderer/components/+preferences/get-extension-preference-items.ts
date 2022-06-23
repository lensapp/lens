/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";

export function getExtensionPreferenceItems(extension?: LensRendererExtension, tabId?: string): RegisteredAppPreference[] {
  if (!extension) {
    return [];
  }

  const preferences = extension.appPreferences.map(preference => ({
    id: preference.id || preference.title,
    ...preference,
  }));

  if (tabId) {
    return preferences.filter(preference => preference.showInPreferencesTab == tabId);
  }

  return preferences.filter(preference => !preference.showInPreferencesTab);
}
