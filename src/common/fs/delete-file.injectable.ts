/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type DeleteFile = (filePath: string) => Promise<void>;

const deleteFileInjectable = getInjectable({
  id: "delete-file",
  instantiate: (di): DeleteFile => di.inject(fsInjectable).unlink,
});

export default deleteFileInjectable;
