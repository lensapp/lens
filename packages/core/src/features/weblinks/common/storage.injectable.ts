/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action, comparer, toJS } from "mobx";
import createPersistentStorageInjectable from "../../persistent-storage/common/create.injectable";
import persistentStorageMigrationsInjectable from "../../persistent-storage/common/migrations.injectable";
import storeMigrationVersionInjectable from "../../../common/vars/store-migration-version.injectable";
import { weblinkStoreMigrationInjectionToken } from "./migration-token";
import weblinksStateInjectable from "./state.injectable";

export interface WeblinkData {
  id: string;
  name: string;
  url: string;
}

export interface WeblinkStoreModel {
  weblinks: WeblinkData[];
}

const weblinksPersistentStorageInjectable = getInjectable({
  id: "weblinks-persistent-storage",
  instantiate: (di) => {
    const state = di.inject(weblinksStateInjectable);
    const createPersistentStorage = di.inject(createPersistentStorageInjectable);

    return createPersistentStorage<WeblinkStoreModel>({
      configName: "lens-weblink-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
      projectVersion: di.inject(storeMigrationVersionInjectable),
      migrations: di.inject(persistentStorageMigrationsInjectable, weblinkStoreMigrationInjectionToken),
      fromStore: action(({ weblinks = [] }) => {
        state.replace(weblinks.map(weblink => [weblink.id, weblink]));
      }),
      toJSON: () => ({
        weblinks: [...toJS(state).values()],
      }),
    });
  },
});

export default weblinksPersistentStorageInjectable;
