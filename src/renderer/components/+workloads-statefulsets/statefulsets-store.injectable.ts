/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { statefulSetStore } from "./statefulset.store";

const statefulsetsStoreInjectable = getInjectable({
  id: "statefulset-store",
  instantiate: () => statefulSetStore,
  causesSideEffects: true,
});

export default statefulsetsStoreInjectable;
