/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { Pod, PodVolume, PodVolumeKind } from "../../../../../common/k8s-api/endpoints";
import { entries } from "../../../../utils";
import { DrawerItem } from "../../../drawer";
import { Icon } from "../../../icon";
import getVolumeVariantComponent from "./variants";

const deprecatedVolumeTypes = new Set<PodVolumeKind>([
  "flocker",
  "gitRepo",
  "quobyte",
  "storageos",
]);

interface VolumeVarientProps {
  pod: Pod;
  volume: PodVolume;
}

export function VolumeVarient({ pod, volume }: VolumeVarientProps) {
  for (const [kind, variant] of entries(volume)) {
    if (kind === "name") {
      continue; // This key is not a kind field
    }

    if (!variant || typeof variant !== "object") {
      continue;
    }

    const isDeprecated = deprecatedVolumeTypes.has(kind);
    const VolumeVariantComponent = getVolumeVariantComponent(kind);

    return (
      <>
        <DrawerItem name="Kind">
          {kind}
          {isDeprecated && <Icon title="Deprecated" material="warning_amber" />}
        </DrawerItem>
        <VolumeVariantComponent variant={variant} pod={pod} volumeName={volume.name} />
      </>
    );
  }

  return <p>Error! Unknown pod volume kind</p>;
}
