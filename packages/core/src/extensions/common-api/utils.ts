/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import openLinkInBrowserInjectable from "../../common/utils/open-link-in-browser.injectable";
import { buildVersionInitializable } from "../../features/vars/build-version/common/token";
import { asLegacyGlobalFunctionForExtensionApi, getLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";

export { Singleton } from "../../common/utils/singleton";

export {
  /**
   * @deprecated Switch to using the `@k8slens/utilities` package
   */
  prevDefault,
  /**
   * @deprecated Switch to using the `@k8slens/utilities` package
   */
  stopPropagation,
  /**
   * @deprecated Switch to using the `@k8slens/utilities` package
   */
  cssNames,
  /**
   * @deprecated Switch to using the `@k8slens/utilities` package
   */
  disposer,
} from "@k8slens/utilities";

export type {
  /**
   * @deprecated Switch to using the `@k8slens/utilities` package
   */
  IClassName,
  /**
   * @deprecated Switch to using the `@k8slens/utilities` package
   */
  IgnoredClassNames,
  /**
   * @deprecated Switch to using the `@k8slens/utilities` package
   */
  Disposer,
  /**
   * @deprecated Switch to using the `@k8slens/utilities` package
   */
  Disposable,
  /**
   * @deprecated Switch to using the `@k8slens/utilities` package
   */
  ExtendableDisposer,
} from "@k8slens/utilities";

export type { OpenLinkInBrowser } from "../../common/utils/open-link-in-browser.injectable";

export const openExternal = asLegacyGlobalFunctionForExtensionApi(openLinkInBrowserInjectable);
export const openBrowser = asLegacyGlobalFunctionForExtensionApi(openLinkInBrowserInjectable);

export const getAppVersion = () => {
  const di = getLegacyGlobalDiForExtensionApi();

  return di.inject(buildVersionInitializable.stateToken);
};
