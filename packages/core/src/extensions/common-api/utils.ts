/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import openLinkInBrowserInjectable from "../../common/utils/open-link-in-browser.injectable";
import buildVersionInjectable from "../../main/vars/build-version/build-version.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { getLegacyGlobalDiForExtensionApi } from "../as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";

export { Singleton } from "../../common/utils";
export { prevDefault, stopPropagation } from "../../renderer/utils/prevDefault";

export type { IClassName, IgnoredClassNames } from "../../renderer/utils";
export { cssNames } from "../../renderer/utils/cssNames";

export type { OpenLinkInBrowser } from "../../common/utils/open-link-in-browser.injectable";

export const openExternal = asLegacyGlobalFunctionForExtensionApi(openLinkInBrowserInjectable);
export const openBrowser = asLegacyGlobalFunctionForExtensionApi(openLinkInBrowserInjectable);

export const getAppVersion = () => {
  const di = getLegacyGlobalDiForExtensionApi();

  return di.inject(buildVersionInjectable).get();
};

export { disposer } from "../../common/utils";
export type { Disposer, Disposable, ExtendableDisposer } from "../../common/utils";
