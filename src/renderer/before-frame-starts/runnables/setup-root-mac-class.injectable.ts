/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import { beforeFrameStartsInjectionToken } from "../tokens";

const setupRootMacClassnameInjectable = getInjectable({
  id: "setup-root-mac-classname",
  instantiate: (di) => {
    const isMac = di.inject(isMacInjectable);

    return {
      id: "setup-root-mac-classname",
      run: () => {
        const rootElem = document.getElementById("app");

        rootElem?.classList.toggle("is-mac", isMac);
      },
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default setupRootMacClassnameInjectable;
