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

const NonInjectedCephFs = (props: PodVolumeVariantSpecificProps<"cephfs"> & Dependencies) => {
  const {
    pod,
    variant: {
      monitors,
      path = "/",
      user = "admin",
      secretFile = "/etc/ceph/user.secret",
      secretRef,
      readOnly = false,
    },
    secretApi,
  } = props;

  return (
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
      <DrawerItem name="Readonly" data-testid="cephfs-readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  );
};

export const CephFs = withInjectables<Dependencies, PodVolumeVariantSpecificProps<"cephfs">>(NonInjectedCephFs, {
  getProps: (di, props) => ({
    ...props,
    secretApi: di.inject(secretApiInjectable),
  }),
});
