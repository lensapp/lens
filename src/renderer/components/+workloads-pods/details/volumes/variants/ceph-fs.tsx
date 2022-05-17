/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { secretApi } from "../../../../../../common/k8s-api/endpoints";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

export const CephFs: VolumeVariantComponent<"cephfs"> = (
  ({ pod, variant: { monitors, path = "/", user = "admin", secretFile = "/etc/ceph/user.secret", secretRef, readOnly }}) => (
    <>
      <DrawerItem name="Monitors">
        <ul>
          {monitors.map(monitor => <li key={monitor}>{monitor}</li>)}
        </ul>
      </DrawerItem>
      <DrawerItem name="Mount Path">
        {path}
      </DrawerItem>
      <DrawerItem name="Username">
        {user}
      </DrawerItem>
      {
        secretRef
          ? (
            <LocalRef
              pod={pod}
              title="Secret"
              kubeRef={secretRef}
              api={secretApi}
            />
          )
          : (
            <DrawerItem name="Secret Filepath">
              {secretFile}
            </DrawerItem>
          )
      }
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  )
);
