/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const FiberChannel: VolumeVariantComponent<"fc"> = (
  ({ variant: { targetWWNs, lun, fsType = "ext4", readOnly = false }}) => (
    <>
      <DrawerItem name="Target World Wide Names">
        <ul>
          {targetWWNs.map(targetWWN => <li key={targetWWN}>{targetWWN}</li>)}
        </ul>
      </DrawerItem>
      <DrawerItem name="Logical Unit Number">
        {lun.toString()}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  )
);
