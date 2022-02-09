/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { history } from "./history";

const historyInjectable = getInjectable({
  id: "history",
  instantiate: () => history,
});

export default historyInjectable;
