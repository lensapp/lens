/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const DownwardAPI: VolumeVariantComponent<"downwardAPI"> = (
  ({ variant: { items }}) => (
    <>
      <DrawerItem name="Items">
        <ul>
          {items.map(item => <li key={item.path}>{item.path}</li>)}
        </ul>
      </DrawerItem>
    </>
  )
);
