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

const NonInjectedRadosBlockDevice = (props: PodVolumeVariantSpecificProps<"rbd"> & Dependencies) => {
  const {
    pod,
    variant: {
      monitors,
      image,
      fsType = "ext4",
      pool = "rbd",
      user = "admin",
      keyring = "/etc/ceph/keyright",
      secretRef,
      readOnly = false,
    },
    secretApi,
  } = props;

  return (
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
  );
};

export const RadosBlockDevice = withInjectables<Dependencies, PodVolumeVariantSpecificProps<"rbd">>(NonInjectedRadosBlockDevice, {
  getProps: (di, props) => ({
    ...props,
    secretApi: di.inject(secretApiInjectable),
  }),
});
