/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getBundledKubectlVersion } from "../../common/utils";
import createKubectlInjectable from "./create-kubectl.injectable";

const bundledKubectlInjectable = getInjectable({
  id: "bundled-kubectl",

  instantiate: (di) => {
    const createKubectl = di.inject(createKubectlInjectable);

    const bundledKubectlVersion = getBundledKubectlVersion();

    return createKubectl(bundledKubectlVersion);
  },
});

export default bundledKubectlInjectable;
