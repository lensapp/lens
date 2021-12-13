/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import entityPreferencesStoreInjectable from "./store.injectable";

const getEntityShortnameInjectable = getInjectable({
  id: "get-entity-shortname",
  instantiate: (di) => {
    const entityPreferencesStore = di.inject(entityPreferencesStoreInjectable);

    return (uid: string) => entityPreferencesStore.preferences.get(uid)?.shortName;
  },
});

export default getEntityShortnameInjectable;
