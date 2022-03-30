/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const VsphereVolume: VolumeVariantComponent<"vsphereVolume"> = (
  ({ variant: { volumePath, fsType = "ext4", storagePolicyName, storagePolicyID }}) => (
    <>
      <DrawerItem name="Virtual Machine Disk Volume">
        {volumePath}
      </DrawerItem>
      <DrawerItem name="Filesystem type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Storage Policy Based Management Profile Name" hidden={!storagePolicyName}>
        {storagePolicyName}
      </DrawerItem>
      <DrawerItem name="Storage Policy Based Management Profile ID" hidden={!storagePolicyID}>
        {storagePolicyID}
      </DrawerItem>
    </>
  )
);
