/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import registerFileProtocolInjectable from "../../../electron-app/features/register-file-protocol.injectable";

import staticDirInjectable from "../../../../common/vars/static-dir.injectable";

const setupFileProtocolInjectable = getInjectable({
  id: "setup-file-protocol",

  instantiate: (di) => {
    const registerFileProtocol = di.inject(registerFileProtocolInjectable);
    const staticDir = di.inject(staticDirInjectable);

    return {
      run: () => {
        registerFileProtocol("static", staticDir);
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupFileProtocolInjectable;
