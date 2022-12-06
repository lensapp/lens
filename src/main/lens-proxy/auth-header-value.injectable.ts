/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import * as uuid from "uuid";
import { lensAuthenticationHeaderValueInjectionToken } from "../../common/auth/header-value";

const authHeaderValueInjectable = getInjectable({
  id: "auth-header-value",
  instantiate: () => `Bearer ${uuid.v4()}`,
  injectionToken: lensAuthenticationHeaderValueInjectionToken,
});

export default authHeaderValueInjectable;
