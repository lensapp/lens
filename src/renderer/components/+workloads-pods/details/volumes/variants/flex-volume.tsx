/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { secretApi } from "../../../../../../common/k8s-api/endpoints";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

export const FlexVolume: VolumeVariantComponent<"flexVolume"> = (
  ({ pod, variant: { driver, fsType, secretRef, readOnly = false, options = {}}}) => (
    <>
      <DrawerItem name="Driver">
        {driver}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType || "-- system default --"}
      </DrawerItem>
      <LocalRef
        pod={pod}
        title="Secret"
        kubeRef={secretRef}
        api={secretApi}
      />
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
      {
        ...Object.entries(options)
          .map(([key, value]) => (
            <DrawerItem key={key} name={`Option: ${key}`}>
              {value}
            </DrawerItem>
          ))
      }
    </>
  )
);
