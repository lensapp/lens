/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const Flocker: VolumeVariantComponent<"flocker"> = (
  ({ variant: { datasetName }}) => (
    <>
      <DrawerItem name="Dataset Name">
        {datasetName}
      </DrawerItem>
    </>
  )
);
