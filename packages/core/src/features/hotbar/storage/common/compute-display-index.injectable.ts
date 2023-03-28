/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import computeHotbarIndexInjectable from "./compute-hotbar-index.injectable";

export type ComputeDisplayIndex = (hotbarId: string) => string;

const computeDisplayIndexInjectable = getInjectable({
  id: "compute-display-index",
  instantiate: (di): ComputeDisplayIndex => {
    const computeHotbarIndex = di.inject(computeHotbarIndexInjectable);

    return (hotbarId) => `${computeHotbarIndex(hotbarId) + 1}`;
  },
});

export default computeDisplayIndexInjectable;
