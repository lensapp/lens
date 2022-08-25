/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type RemovePath = (path: string) => Promise<void>;

const removePathInjectable = getInjectable({
  id: "remove-path",
  instantiate: (di): RemovePath => di.inject(fsInjectable).remove,
});

export default removePathInjectable;
