/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type RemovePath = (filePath: string) => Promise<void>;

const removePathInjectable = getInjectable({
  id: "remove-path",
  instantiate: (di): RemovePath => {
    const { rm } = di.inject(fsInjectable);

    return (filePath) => rm(filePath, { force: true, recursive: true });
  },
});

export default removePathInjectable;
