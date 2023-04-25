/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const AzureFile: VolumeVariantComponent<"azureFile"> = (
  ({ variant: { readOnly = false, secretName, shareName, secretNamespace = "default" }}) => (
    <>
      <DrawerItem name="Secret Name">
        {secretName}
      </DrawerItem>
      <DrawerItem name="Share Name">
        {shareName}
      </DrawerItem>
      <DrawerItem name="Namespace of Secret">
        {secretNamespace}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  )
);
