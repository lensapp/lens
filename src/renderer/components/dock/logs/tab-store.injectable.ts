/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LogTabStore } from "./tab-store";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const logTabStoreInjectable = getInjectable({
  id: "log-tab-store",

  instantiate: (di) => new LogTabStore({
    createStorage: di.inject(createStorageInjectable),
  }),
});

export default logTabStoreInjectable;
