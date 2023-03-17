/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Hotbar } from "./hotbar";
import computeDisplayIndexInjectable from "./compute-display-index.injectable";

export type ComputeHotbarDisplayLabel = (hotbar: Hotbar) => string;

const computeHotbarDisplayLabelInjectable = getInjectable({
  id: "compute-hotbar-display-label",
  instantiate: (di): ComputeHotbarDisplayLabel => {
    const computeDisplayIndex = di.inject(computeDisplayIndexInjectable);

    return (hotbar) => `${computeDisplayIndex(hotbar.id)}: ${hotbar.name}`;
  },
});

export default computeHotbarDisplayLabelInjectable;
