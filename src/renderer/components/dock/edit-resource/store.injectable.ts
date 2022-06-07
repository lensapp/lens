/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { EditResourceTabStore } from "./store";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager/manager.injectable";

const editResourceTabStoreInjectable = getInjectable({
  id: "edit-resource-tab-store",

  instantiate: (di) => new EditResourceTabStore({
    createStorage: di.inject(createStorageInjectable),
    apiManager: di.inject(apiManagerInjectable),
  }),
});

export default editResourceTabStoreInjectable;
