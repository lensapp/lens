/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { secretApi } from "../../../../../../common/k8s-api/endpoints";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

export const ScaleIo: VolumeVariantComponent<"scaleIO"> = (
  ({ pod, variant: { gateway, system, secretRef, sslEnabled = false, protectionDomain, storagePool, storageMode = "ThinProvisioned", volumeName, fsType = "xfs", readOnly = false }}) => (
    <>
      <DrawerItem name="Gateway">
        {gateway}
      </DrawerItem>
      <DrawerItem name="System">
        {system}
      </DrawerItem>
      <LocalRef
        pod={pod}
        title="Name"
        kubeRef={secretRef}
        api={secretApi}
      />
      <DrawerItem name="SSL Enabled">
        {sslEnabled.toString()}
      </DrawerItem>
      <DrawerItem name="Protection Domain Name" hidden={!protectionDomain}>
        {protectionDomain}
      </DrawerItem>
      <DrawerItem name="Storage Pool" hidden={!storagePool}>
        {storagePool}
      </DrawerItem>
      <DrawerItem name="Storage Mode" hidden={!storageMode}>
        {storageMode}
      </DrawerItem>
      <DrawerItem name="Volume Name">
        {volumeName}
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
