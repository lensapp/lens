/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import installedExtensionsInjectable from "../../common/installed-extensions.injectable";
import requestLoadedExtensionsInjectable from "./request-loaded-extensions.injectable";

const initializeInstalledExtensionsInjectable = getInjectable({
  id: "initialize-installed-extensions",
  instantiate: (di) => ({
    id: "initialize-installed-extensions",
    run: async () => {
      const installedExtensions = di.inject(installedExtensionsInjectable);
      const requestLoadedExtensions = di.inject(requestLoadedExtensionsInjectable);

      installedExtensions.replace(await requestLoadedExtensions());
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initializeInstalledExtensionsInjectable;
