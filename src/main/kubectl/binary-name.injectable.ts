/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import binaryNameInjectable from "../../common/utils/binary-name.injectable";

const kubectlBinaryNameInjectable = getInjectable({
  id: "kubectl-binary-name",
  instantiate: (di) => di.inject(binaryNameInjectable, "kubectl"),
});

export default kubectlBinaryNameInjectable;
