/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const AzureDisk: VolumeVariantComponent<"azureDisk"> = (
  ({ variant: { diskName, diskURI, kind = "Shared", cachingMode = "None", fsType = "ext4", readonly = false }}) => (
    <>
      <DrawerItem name={kind === "Managed" ? "Disk Name" : "VHD blob Name"}>
        {diskName}
      </DrawerItem>
      <DrawerItem name={kind === "Managed" ? "Resource ID" : "Disk URI"}>
        {diskURI}
      </DrawerItem>
      <DrawerItem name="Kind">
        {kind}
      </DrawerItem>
      <DrawerItem name="Caching Mode">
        {cachingMode}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readonly.toString()}
      </DrawerItem>
    </>
  )
);
