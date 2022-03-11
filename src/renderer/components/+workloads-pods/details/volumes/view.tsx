/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observer } from "mobx-react";
import React from "react";
import type { Pod } from "../../../../../common/k8s-api/endpoints";
import { DrawerTitle } from "../../../drawer";
import { Icon } from "../../../icon";
import { VolumeVarient } from "./variant";

export interface PodVolumesProps {
  pod: Pod;
}

export const PodVolumes = observer(({ pod }: PodVolumesProps) => {
  const volumes = pod.getVolumes() ?? [];

  if (volumes.length === 0) {
    return null;
  }

  return (
    <>
      <DrawerTitle>Volumes</DrawerTitle>
      {volumes.map(volume => (
        <div key={volume.name} className="volume">
          <div className="title flex gaps">
            <Icon small material="storage" />
            <span>{volume.name}</span>
          </div>
          <VolumeVarient pod={pod} volume={volume} />
        </div>
      ))}
    </>
  );
});
