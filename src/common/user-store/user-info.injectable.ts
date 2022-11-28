/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userInfo } from "os";

const userInfoInjectable = getInjectable({
  id: "user-info",
  instantiate: () => userInfo(),
  causesSideEffects: true,
});

export default userInfoInjectable;
