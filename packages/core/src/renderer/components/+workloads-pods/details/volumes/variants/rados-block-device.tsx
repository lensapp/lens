/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { secretApi } from "../../../../../../common/k8s-api/endpoints";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

export const RadosBlockDevice: VolumeVariantComponent<"rbd"> = (
  ({ pod, variant: { monitors, image, fsType = "ext4", pool = "rbd", user = "admin", keyring = "/etc/ceph/keyright", secretRef, readOnly = false }}) => (
    <>
      <DrawerItem name="Ceph Monitors">
        <ul>
          {monitors.map(monitor => <li key={monitor}>{monitor}</li>)}
        </ul>
      </DrawerItem>
      <DrawerItem name="Image">
        {image}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Pool">
        {pool}
      </DrawerItem>
      <DrawerItem name="User">
        {user}
      </DrawerItem>
      {
        secretRef
          ? (
            <LocalRef
              pod={pod}
              title="Authentication Secret"
              kubeRef={secretRef}
              api={secretApi}
            />
          )
          : (
            <DrawerItem name="Keyright Path">
              {keyring}
            </DrawerItem>
          )
      }
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  )
);
