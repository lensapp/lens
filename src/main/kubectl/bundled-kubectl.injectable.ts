/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { getBundledKubectlVersion } from "../../common/utils";
import createKubectlInjectable from "./create-kubectl.injectable";

const bundledKubectlInjectable = getInjectable({
  instantiate: (di) => {
    const createKubectl = di.inject(createKubectlInjectable);

    return createKubectl(getBundledKubectlVersion());
  },

  lifecycle: lifecycleEnum.singleton,
});

export default bundledKubectlInjectable;
