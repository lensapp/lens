/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { EditResourceTabStore } from "./store";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager.injectable";
import editResourceTabStorageInjectable from "./storage.injectable";

const editResourceTabStoreInjectable = getInjectable({
  instantiate: (di) => new EditResourceTabStore({
    apiManager: di.inject(apiManagerInjectable),
    storage: di.inject(editResourceTabStorageInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default editResourceTabStoreInjectable;
