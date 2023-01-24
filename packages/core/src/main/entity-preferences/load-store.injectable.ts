/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import entityPreferencesStoreInjectable from "../../common/entity-preferences/store.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../start-main-application/runnable-tokens/before-application-is-loading-injection-token";

const loadEntityPreferencesStoreInjectable = getInjectable({
  id: "load-entity-preferences-store",
  instantiate: (di) => ({
    id: "load-entity-preferences-store",
    run: () => {
      const store = di.inject(entityPreferencesStoreInjectable);

      store.load();
    },
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default loadEntityPreferencesStoreInjectable;
