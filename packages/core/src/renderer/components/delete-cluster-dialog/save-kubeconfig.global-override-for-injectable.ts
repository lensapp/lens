/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import saveKubeconfigInjectable from "./save-kubeconfig.injectable";

export default getGlobalOverride(saveKubeconfigInjectable, () => async () => {
  throw new Error("tried to save a mondified kubeconfig without override");
});
