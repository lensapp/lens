/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import userStoreInjectable from "../../common/user-store/user-store.injectable";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
export interface UserPreferenceExtensionItems {
  /**
   * Get the configured kubectl binaries path.
   */
  getKubectlPath: () => string | undefined;
}

const userStore = asLegacyGlobalForExtensionApi(userStoreInjectable);

export const Preferences: UserPreferenceExtensionItems = {
  getKubectlPath: () => userStore.kubectlBinariesPath,
};
