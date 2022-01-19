/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { hideDetails } from "../../kube-detail-params";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

const hideDetailsInjectable = getInjectable({
  instantiate: () => hideDetails,
  lifecycle: lifecycleEnum.singleton,
});

export default hideDetailsInjectable;
