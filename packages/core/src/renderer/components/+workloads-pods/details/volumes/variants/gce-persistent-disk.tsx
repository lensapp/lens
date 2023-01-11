/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const GcePersistentDisk: VolumeVariantComponent<"gcePersistentDisk"> = (
  ({ variant: { pdName, fsType = "ext4" }}) => (
    <>
      <DrawerItem name="Persistent Disk Name">
        {pdName}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
    </>
  )
);
