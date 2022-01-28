/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import podStoreInjectable from "./store.injectable";

const podsInjectable = getInjectable({
  instantiate: (di) => computed(() => [...di.inject(podStoreInjectable).items]),
  lifecycle: lifecycleEnum.singleton,
});

export default podsInjectable;
