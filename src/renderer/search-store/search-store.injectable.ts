/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "../components/dock/dock-store/dock-store.injectable";
import { SearchStore } from "./search-store";

const searchStoreInjectable = getInjectable({
  instantiate: (di) => new SearchStore({
    dockStore: di.inject(dockStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default searchStoreInjectable;
