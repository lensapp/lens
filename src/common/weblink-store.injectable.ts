/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { WeblinkStore } from "./weblink-store";

const weblinkStoreInjectable = getInjectable({
  id: "weblink-store",
  instantiate: () => new WeblinkStore(),
});

export default weblinkStoreInjectable;
