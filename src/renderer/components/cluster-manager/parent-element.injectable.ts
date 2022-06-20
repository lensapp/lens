/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";

const clusterFrameParentElementInjectable = getInjectable({
  id: "cluster-frame-parent-element",
  instantiate: () => {
    const elem = document.getElementById("#lens-view");

    assert(elem, "DOM with #lens-views must be present");

    return elem;
  },
  causesSideEffects: true,
});

export default clusterFrameParentElementInjectable;
