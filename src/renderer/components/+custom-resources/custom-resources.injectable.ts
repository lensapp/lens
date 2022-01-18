/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { crdStore } from "./crd.store";

const customResourceDefinitionsInjectable = getInjectable({
  instantiate: () => computed(() => [...crdStore.items]),

  lifecycle: lifecycleEnum.singleton,
});

export default customResourceDefinitionsInjectable;
