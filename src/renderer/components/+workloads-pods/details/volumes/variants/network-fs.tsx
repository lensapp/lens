/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const NetworkFs: VolumeVariantComponent<"nfs"> = (
  ({ variant: { server, path, readOnly = false }}) => (
    <>
      <DrawerItem name="Server">
        {server}
      </DrawerItem>
      <DrawerItem name="Path">
        {path}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  )
);
