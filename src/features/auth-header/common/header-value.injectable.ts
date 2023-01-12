/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import authHeaderStateInjectable from "./header-state.injectable";

const authHeaderValueInjectable = getInjectable({
  id: "auth-header-value",
  instantiate: (di) => `Bearer ${di.inject(authHeaderStateInjectable).get()}`,
});

export default authHeaderValueInjectable;
