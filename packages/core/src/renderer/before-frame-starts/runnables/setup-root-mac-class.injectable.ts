/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import rootElementInjectable from "../../window/root-element.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../tokens";

const setupRootMacClassnameInjectable = getInjectable({
  id: "setup-root-mac-classname",
  instantiate: (di) => ({
    id: "setup-root-mac-classname",
    run: () => {
      const isMac = di.inject(isMacInjectable);
      const rootElem = di.inject(rootElementInjectable);

      rootElem.classList.toggle("is-mac", isMac);
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default setupRootMacClassnameInjectable;
