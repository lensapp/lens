/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { protocol } from "electron";
import getAbsolutePathInjectable from "../../../common/path/get-absolute-path.injectable";

const registerFileProtocolInjectable = getInjectable({
  id: "register-file-protocol",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);

    return (name: string, basePath: string) => {
      protocol.registerFileProtocol(name, (request, callback) => {
        const filePath = request.url.replace(`${name}://`, "");
        const absPath = getAbsolutePath(basePath, filePath);

        callback({ path: absPath });
      });
    };
  },

  causesSideEffects: true,
});

export default registerFileProtocolInjectable;
