/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import bundledKubectlVersionInjectable from "../../common/vars/bundled-kubectl-version.injectable";
import createKubectlInjectable from "./create-kubectl.injectable";

const bundledKubectlInjectable = getInjectable({
  id: "bundled-kubectl",

  instantiate: (di) => {
    const createKubectl = di.inject(createKubectlInjectable);
    const bundledKubectlVersion = di.inject(bundledKubectlVersionInjectable);

    return createKubectl(bundledKubectlVersion);
  },
});

export default bundledKubectlInjectable;
