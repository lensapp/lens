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
import type { IClassName } from "../../renderer/utils/cssNames";
import { cssNames } from "../../renderer/utils/cssNames";

export interface UtilsExtensionItems {
  Singleton: typeof Singleton;
  prevDefault: <E extends React.SyntheticEvent | Event, R>(callback: (evt: E) => R) => (evt: E) => R;
  stopPropagation: (evt: Event | React.SyntheticEvent) => void;
  cssNames: (...classNames: IClassName[]) => string;
  openExternal: (url: string) => Promise<void>;
  openBrowser: (url: string) => Promise<void>;
  getAppVersion: () => string;
}

export const Util: UtilsExtensionItems = {
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
};
