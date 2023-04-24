/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createBrowserHistory } from "history";
import type { History } from "history";

const historyInjectable = getInjectable({
  id: "history",
  instantiate: (): History => createBrowserHistory(),
});

export default historyInjectable;
