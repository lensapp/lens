/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "./user-store.injectable";

const resolvedShellInjectable = getInjectable({
  id: "resolved-shell",
  instantiate: (di) => di.inject(userStoreInjectable).resolvedShell,
});

export default resolvedShellInjectable;
