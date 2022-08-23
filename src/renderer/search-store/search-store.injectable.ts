/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { SearchStore } from "./search-store";

const searchStoreInjectable = getInjectable({
  id: "search-store",
  instantiate: () => new SearchStore(),
  lifecycle: lifecycleEnum.transient,
});

export default searchStoreInjectable;
