/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationToken from "./application-information-token";

const bundledKubectlVersionInjectable = getInjectable({
  id: "bundled-kubectl-version",
  instantiate: (di) => di.inject(applicationInformationToken).config.bundledKubectlVersion,
});

export default bundledKubectlVersionInjectable;
