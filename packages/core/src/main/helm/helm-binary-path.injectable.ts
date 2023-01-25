/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import bundledBinaryPathInjectable from "../../common/utils/bundled-binary-path.injectable";

const helmBinaryPathInjectable = getInjectable({
  id: "helm-binary-path",
  instantiate: (di) => di.inject(bundledBinaryPathInjectable, "helm"),
});

export default helmBinaryPathInjectable;
