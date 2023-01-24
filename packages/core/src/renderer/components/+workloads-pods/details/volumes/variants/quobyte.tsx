/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const Quobyte: VolumeVariantComponent<"quobyte"> = (
  ({ variant: { registry, volume, readOnly = false, user = "serviceaccount", group, tenant }}) => (
    <>
      <DrawerItem name="Registry">
        {registry}
      </DrawerItem>
      <DrawerItem name="Volume">
        {volume}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
      <DrawerItem name="User">
        {user}
      </DrawerItem>
      <DrawerItem name="Group">
        {group ?? "-- no group --"}
      </DrawerItem>
      <DrawerItem name="Tenant" hidden={!tenant}>
        {tenant}
      </DrawerItem>
    </>
  )
);
