/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { dump } from "js-yaml";
import React from "react";
import { DrawerItem, DrawerItemLabels } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";

export const Ephemeral: VolumeVariantComponent<"ephemeral"> = (
  ({ pod, volumeName, variant: { volumeClaimTemplate: { metadata = {}, spec }}}) => (
    <>
      <DrawerItem name="PVC Template Name">
        {`${pod.getName()}-${volumeName}`}
      </DrawerItem>
      <DrawerItemLabels
        name="Template Labels"
        labels={metadata.labels ?? {}}
      />
      <DrawerItemLabels
        name="Template Annotations"
        labels={metadata.annotations ?? {}}
      />
      <DrawerItem name="Template PVC Spec">
        {dump(spec)}
      </DrawerItem>
    </>
  )
);
