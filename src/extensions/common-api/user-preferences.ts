/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { UserStore } from "../../common/user-store";
export interface UserPreferenceExtensionItems {
  /**
   * Get the configured kubectl binaries path.
   */
  getKubectlPath: () => string | undefined;
}

export const Preferences: UserPreferenceExtensionItems = {
  getKubectlPath: () => UserStore.getInstance().kubectlBinariesPath,
};
