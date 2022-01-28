/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { PersistentVolumeClaimApi } from "./persistent-volume-claims.api";

const persistentVolumeClaimApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/api/v1/persistentvolumeclaims") as PersistentVolumeClaimApi,
  lifecycle: lifecycleEnum.singleton,
});

export default persistentVolumeClaimApiInjectable;
