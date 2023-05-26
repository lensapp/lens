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

const NonInjectedScaleIo = (props: PodVolumeVariantSpecificProps<"scaleIO"> & Dependencies) => {
  const {
    pod,
    variant: {
      gateway,
      system,
      secretRef,
      sslEnabled = false,
      protectionDomain,
      storagePool,
      storageMode = "ThinProvisioned",
      volumeName,
      fsType = "xfs",
      readOnly = false,
    },
    secretApi,
  } = props;

  return (
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
  );
};

export const ScaleIo = withInjectables<Dependencies, PodVolumeVariantSpecificProps<"scaleIO">>(NonInjectedScaleIo, {
  getProps: (di, props) => ({
    ...props,
    secretApi: di.inject(secretApiInjectable),
  }),
});
