/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { CreateResourceTabStore } from "./store";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const createResourceTabStoreInjectable = getInjectable({
  id: "create-resource-tab-store",

  instantiate: (di) => new CreateResourceTabStore({
    createStorage: di.inject(createStorageInjectable),
  }),
});

export default createResourceTabStoreInjectable;
