/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { syncWeblinks } from "./weblinks";
import weblinkStoreInjectable from "../../common/weblinks-store/weblink-store.injectable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";

const syncWeblinksInjectable = getInjectable({
  id: "sync-weblinks",

  instantiate: (di) => syncWeblinks({
    weblinkStore: di.inject(weblinkStoreInjectable),
    catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
  }),
});

export default syncWeblinksInjectable;
