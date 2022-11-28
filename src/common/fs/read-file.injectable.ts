/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type ReadFile = (filePath: string) => Promise<string>;

const readFileInjectable = getInjectable({
  id: "read-file",

  instantiate: (di): ReadFile => {
    const { readFile } = di.inject(fsInjectable);

    return (filePath) => readFile(filePath, "utf-8");
  },
});

export default readFileInjectable;
