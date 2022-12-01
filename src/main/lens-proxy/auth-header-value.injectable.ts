/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import * as uuid from "uuid";

const authHeaderValueInjectable = getInjectable({
  id: "auth-header-value",
  instantiate: () => uuid.v4(),
});

export default authHeaderValueInjectable;
