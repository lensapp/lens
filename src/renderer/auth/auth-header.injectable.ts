/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensAuthenticationHeaderValueInjectionToken } from "../../common/auth/header-value";
import authHeaderValueStateInjectable from "./auth-header-state.injectable";

const authHeaderValueInjectable = getInjectable({
  id: "auth-header-value",
  instantiate: (di) => di.inject(authHeaderValueStateInjectable).get(),
  injectionToken: lensAuthenticationHeaderValueInjectionToken,
});

export default authHeaderValueInjectable;
