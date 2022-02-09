/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { hideDetails } from "../../kube-detail-params";
import { getInjectable } from "@ogre-tools/injectable";

const hideDetailsInjectable = getInjectable({
  id: "hide-details",
  instantiate: () => hideDetails,
});

export default hideDetailsInjectable;
