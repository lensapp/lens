/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { StorageClassStore } from "./store";

const storageClassStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/apis/storage.k8s.io/v1/storageclasses") as StorageClassStore,
  lifecycle: lifecycleEnum.singleton,
});

export default storageClassStoreInjectable;
