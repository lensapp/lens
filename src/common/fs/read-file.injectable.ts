/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

const readFileInjectable = getInjectable({
  id: "read-file",

  instantiate: (di) => (filePath: string) =>
    di.inject(fsInjectable).readFile(filePath, "utf-8"),
});

export default readFileInjectable;
