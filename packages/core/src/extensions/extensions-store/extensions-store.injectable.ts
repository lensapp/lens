/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createPersistentStorageInjectable from "../../common/persistent-storage/create.injectable";
import storeMigrationVersionInjectable from "../../common/vars/store-migration-version.injectable";
import { ExtensionsStore } from "./extensions-store";

const extensionsStoreInjectable = getInjectable({
  id: "extensions-store",
  instantiate: (di) => new ExtensionsStore({
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
    createPersistentStorage: di.inject(createPersistentStorageInjectable),
  }),
});

export default extensionsStoreInjectable;
