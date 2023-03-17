/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import appNameInjectable from "../../common/vars/app-name.injectable";
import isLinuxInjectable from "../../common/vars/is-linux.injectable";
import isMacInjectable from "../../common/vars/is-mac.injectable";
import isSnapPackageInjectable from "../../common/vars/is-snap-package.injectable";
import isWindowsInjectable from "../../common/vars/is-windows.injectable";
import { getLegacyGlobalDiForExtensionApi } from "../as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import { issuesTrackerUrl } from "../../common/vars";
import { buildVersionInjectionToken } from "../../common/vars/build-semantic-version.injectable";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import enabledExtensionsInjectable from "../../features/extensions/enabled/common/enabled-extensions.injectable";
import userPreferencesStateInjectable from "../../features/user-preferences/common/state.injectable";

const userStore = asLegacyGlobalForExtensionApi(userPreferencesStateInjectable);
const enabledExtensions = asLegacyGlobalForExtensionApi(enabledExtensionsInjectable);

export const App = {
  Preferences: {
    getKubectlPath: () => userStore.kubectlBinariesPath,
  },
  getEnabledExtensions: () => enabledExtensions.get(),
  get version() {
    const di = getLegacyGlobalDiForExtensionApi();

    return di.inject(buildVersionInjectionToken).get();
  },
  get appName() {
    const di = getLegacyGlobalDiForExtensionApi();

    return di.inject(appNameInjectable);
  },
  get isSnap() {
    const di = getLegacyGlobalDiForExtensionApi();

    return di.inject(isSnapPackageInjectable);
  },
  get isWindows() {
    const di = getLegacyGlobalDiForExtensionApi();

    return di.inject(isWindowsInjectable);
  },
  get isMac() {
    const di = getLegacyGlobalDiForExtensionApi();

    return di.inject(isMacInjectable);
  },
  get isLinux() {
    const di = getLegacyGlobalDiForExtensionApi();

    return di.inject(isLinuxInjectable);
  },
  /**
   * @deprecated This value is now `""` and is left here for backwards compatibility.
   */
  slackUrl: "",
  issuesTrackerUrl,
} as const;
