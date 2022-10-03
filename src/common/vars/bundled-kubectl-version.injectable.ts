/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationInjectable from "./application-information.injectable";

const bundledKubectlVersionInjectable = getInjectable({
  id: "bundled-kubectl-version",
  instantiate: (di) => di.inject(applicationInformationInjectable).config.bundledKubectlVersion,
});

export default bundledKubectlVersionInjectable;
