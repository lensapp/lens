/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import registerFileProtocolInjectable from "../../electron-app/features/register-file-protocol.injectable";
import staticFilesDirectoryInjectable from "../../../common/vars/static-files-directory.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../runnable-tokens/before-application-is-loading-injection-token";

const setupFileProtocolInjectable = getInjectable({
  id: "setup-file-protocol",

  instantiate: (di) => {
    const registerFileProtocol = di.inject(registerFileProtocolInjectable);
    const staticFilesDirectory = di.inject(staticFilesDirectoryInjectable);

    return {
      run: () => {
        registerFileProtocol("static", staticFilesDirectory);
      },
    };
  },

  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupFileProtocolInjectable;
