/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { SecretApi } from "@k8slens/kube-api";
import { secretApiInjectable } from "@k8slens/kube-api-specifics";
import { DrawerItem } from "../../../../drawer";
import type { PodVolumeVariantSpecificProps } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

interface Dependencies {
  secretApi: SecretApi;
}

const NonInjectedContainerStorageInterface = (props: PodVolumeVariantSpecificProps<"csi"> & Dependencies) => {
  const {
    pod,
    variant: {
      driver,
      readOnly = false,
      fsType = "ext4",
      volumeAttributes = {},
      nodePublishSecretRef,
      controllerPublishSecretRef,
      nodeStageSecretRef,
      controllerExpandSecretRef,
    },
    secretApi,
  } = props;

  return (
    <>
      <DrawerItem name="Driver">
        {driver}
      </DrawerItem>
      <DrawerItem name="ReadOnly">
        {readOnly.toString()}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <LocalRef
        pod={pod}
        title="Controller Publish Secret"
        kubeRef={controllerPublishSecretRef}
        api={secretApi} />
      <LocalRef
        pod={pod}
        title="Controller Expand Secret"
        kubeRef={controllerExpandSecretRef}
        api={secretApi} />
      <LocalRef
        pod={pod}
        title="Node Publish Secret"
        kubeRef={nodePublishSecretRef}
        api={secretApi} />
      <LocalRef
        pod={pod}
        title="Node Stage Secret"
        kubeRef={nodeStageSecretRef}
        api={secretApi} />
      {Object.entries(volumeAttributes)
        .map(([key, value]) => (
          <DrawerItem key={key} name={key}>
            {value}
          </DrawerItem>
        ))}
    </>
  );
};

export const ContainerStorageInterface = withInjectables<Dependencies, PodVolumeVariantSpecificProps<"csi">>(NonInjectedContainerStorageInterface, {
  getProps: (di, props) => ({
    ...props,
    secretApi: di.inject(secretApiInjectable),
  }),
});
