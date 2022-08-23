/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { secretApi } from "../../../../../../common/k8s-api/endpoints";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

export const StorageOs: VolumeVariantComponent<"storageos"> = (
  ({ pod, variant: { volumeName, volumeNamespace, fsType = "ext4", readOnly = false, secretRef }}) => (
    <>
      <DrawerItem name="Volume Name">
        {volumeName}
      </DrawerItem>
      <DrawerItem name="Volume Namespace" hidden={volumeNamespace === "default"}>
        {
          volumeNamespace === volumeName
            ? "- no default behaviour -"
            : volumeNamespace || pod.getNs()
        }
      </DrawerItem>
      <DrawerItem name="Filesystem type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
      <LocalRef
        pod={pod}
        title="Secret"
        kubeRef={secretRef}
        api={secretApi}
      />
    </>
  )
);
