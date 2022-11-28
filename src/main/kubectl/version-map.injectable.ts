/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import bundledKubectlVersionInjectable from "../../common/vars/bundled-kubectl-version.injectable";

const kubectlVersionMapInjectable = getInjectable({
  id: "kubectl-version-map",
  instantiate: (di) => {
    const bundledKubectlVersion = di.inject(bundledKubectlVersionInjectable);

    return new Map([
      ["1.7", "1.8.15"],
      ["1.8", "1.9.10"],
      ["1.9", "1.10.13"],
      ["1.10", "1.11.10"],
      ["1.11", "1.12.10"],
      ["1.12", "1.13.12"],
      ["1.13", "1.13.12"],
      ["1.14", "1.14.10"],
      ["1.15", "1.15.11"],
      ["1.16", "1.16.15"],
      ["1.17", "1.17.17"],
      ["1.18", "1.18.20"],
      ["1.19", "1.19.12"],
      ["1.20", "1.20.8"],
      ["1.21", "1.21.9"],
      ["1.22", "1.22.6"],
      ["1.23", bundledKubectlVersion],
    ]);
  },
});

export default kubectlVersionMapInjectable;
