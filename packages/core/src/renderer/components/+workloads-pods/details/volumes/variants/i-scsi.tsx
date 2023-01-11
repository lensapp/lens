/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const IScsi: VolumeVariantComponent<"iscsi"> = (
  ({ variant: { targetPortal, iqn, lun, fsType = "ext4", readOnly = false, chapAuthDiscovery, chapAuthSession, secretRef }}) => (
    <>
      <DrawerItem name="Target Address">
        {targetPortal}
      </DrawerItem>
      <DrawerItem name="iSCSI qualified name">
        {iqn}
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
      {chapAuthDiscovery && (
        <DrawerItem name="CHAP Discovery Authentication">
          {chapAuthDiscovery.toString()}
        </DrawerItem>
      )}
      {chapAuthSession && (
        <DrawerItem name="CHAP Session Authentication">
          {chapAuthSession.toString()}
        </DrawerItem>
      )}
      { secretRef && (
        <DrawerItem name="CHAP Secret">
          {secretRef.name}
        </DrawerItem>
      )}
    </>
  )
);
