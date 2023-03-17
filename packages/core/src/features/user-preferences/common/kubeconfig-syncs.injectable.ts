/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userPreferencesStateInjectable from "./state.injectable";

const kubeconfigSyncsInjectable = getInjectable({
  id: "kubeconfig-syncs",
  instantiate: (di) => di.inject(userPreferencesStateInjectable).syncKubeconfigEntries,
});

export default kubeconfigSyncsInjectable;
