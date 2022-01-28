/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageClassApi } from "./storage-class.api";
import apiManagerInjectable from "../api-manager.injectable";

const storageClassApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/storage.k8s.io/v1/storageclasses") as StorageClassApi,
  lifecycle: lifecycleEnum.singleton,
});

export default storageClassApiInjectable;
