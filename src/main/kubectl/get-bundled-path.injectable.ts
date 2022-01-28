/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bundledKubectlPath } from "./kubectl";

const bundledKubectlPathInjectable = getInjectable({
  instantiate: () => bundledKubectlPath,
  lifecycle: lifecycleEnum.singleton,
});

export default bundledKubectlPathInjectable;
