/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Register custom protocols

import { protocol } from "electron";
import path from "path";

export function registerFileProtocol(name: string, basePath: string) {
  protocol.registerFileProtocol(name, (request, callback) => {
    const filePath = request.url.replace(`${name}://`, "");
    const absPath = path.resolve(basePath, filePath);

    callback({ path: absPath });
  });
}
