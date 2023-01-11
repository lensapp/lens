/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const EmptyDir: VolumeVariantComponent<"emptyDir"> = (
  ({ variant: { medium, sizeLimit }}) => (
    <>
      <DrawerItem name="Medium">
        {medium || "<node's default medium>"}
      </DrawerItem>
      <DrawerItem name="Size Limit" hidden={!sizeLimit}>
        {sizeLimit}
      </DrawerItem>
    </>
  )
);
