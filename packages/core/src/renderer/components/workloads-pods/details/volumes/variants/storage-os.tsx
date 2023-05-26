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

const NonInjectedStorageOs = (props: PodVolumeVariantSpecificProps<"storageos"> & Dependencies) => {
  const {
    pod,
    variant: { volumeName, volumeNamespace, fsType = "ext4", readOnly = false, secretRef },
    secretApi,
  } = props;

  return (
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
  );
};

export const StorageOs = withInjectables<Dependencies, PodVolumeVariantSpecificProps<"storageos">>(NonInjectedStorageOs, {
  getProps: (di, props) => ({
    ...props,
    secretApi: di.inject(secretApiInjectable),
  }),
});
