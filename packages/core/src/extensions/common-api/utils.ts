/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import openLinkInBrowserInjectable from "../../common/utils/open-link-in-browser.injectable";
import buildVersionInjectable from "../../main/vars/build-version/build-version.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { getLegacyGlobalDiForExtensionApi } from "../as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import { Singleton } from "../../common/utils";
import { prevDefault, stopPropagation } from "../../renderer/utils/prevDefault";
import { cssNames } from "../../renderer/utils/cssNames";

export const Util = {
  Singleton,
  prevDefault,
  stopPropagation,
  cssNames,
  openExternal: asLegacyGlobalFunctionForExtensionApi(openLinkInBrowserInjectable),
  openBrowser: asLegacyGlobalFunctionForExtensionApi(openLinkInBrowserInjectable),
  getAppVersion: () => {
    const di = getLegacyGlobalDiForExtensionApi();

    return di.inject(buildVersionInjectable).get();
  },
} as const;
