/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type Unlink = (path: string) => Promise<void>;

const unlinkInjectable = getInjectable({
  id: "unlink",
  instantiate: (di): Unlink => di.inject(fsInjectable).unlink,
});

export default unlinkInjectable;
