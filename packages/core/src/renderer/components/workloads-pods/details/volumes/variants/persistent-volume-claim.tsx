/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { PersistentVolumeClaimApi } from "@k8slens/kube-api";
import { persistentVolumeClaimApiInjectable } from "@k8slens/kube-api-specifics";
import type { PodVolumeVariantSpecificProps } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

interface Dependencies {
  persistentVolumeClaimApi: PersistentVolumeClaimApi;
}

const NonInjectedPersistentVolumeClaim = (props: PodVolumeVariantSpecificProps<"persistentVolumeClaim"> & Dependencies) => {
  const {
    pod,
    variant: { claimName },
    persistentVolumeClaimApi,
  } = props;

  return (
    <LocalRef
      pod={pod}
      title="Name"
      kubeRef={{ name: claimName }}
      api={persistentVolumeClaimApi}
    />
  );
};

export const PersistentVolumeClaim = withInjectables<Dependencies, PodVolumeVariantSpecificProps<"persistentVolumeClaim">>(NonInjectedPersistentVolumeClaim, {
  getProps: (di, props) => ({
    ...props,
    persistentVolumeClaimApi: di.inject(persistentVolumeClaimApiInjectable),
  }),
});
