/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { podsStore } from "./pods.store";

const podsStoreInjectable = getInjectable({
  id: "pods-store",
  instantiate: () => podsStore,
  causesSideEffects: true,
});

export default podsStoreInjectable;
