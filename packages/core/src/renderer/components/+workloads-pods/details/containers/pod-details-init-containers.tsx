/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { DrawerTitle } from "../../../drawer";
import { PodDetailsContainer } from "../../pod-details-container";
import type { Pod } from "../../../../../common/k8s-api/endpoints";
import { observer } from "mobx-react";

interface PodDetailsContainersProps {
  pod: Pod;
}

const NonInjectedPodDetailsInitContainers = observer(({ pod }: PodDetailsContainersProps) => {
  const initContainers = pod.getInitContainers();

  if (initContainers.length === 0) {
    return null;
  }

  return (
    <>
      <DrawerTitle>Init Containers</DrawerTitle>
      {initContainers.map(container => (
        <PodDetailsContainer
          key={container.name}
          pod={pod}
          container={container}
        />
      ))}
    </>
  );
});

const PodDetailsInitContainers = NonInjectedPodDetailsInitContainers;

export { PodDetailsInitContainers };


