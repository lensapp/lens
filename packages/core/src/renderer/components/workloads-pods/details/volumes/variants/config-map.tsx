/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { ConfigMapApi } from "@k8slens/kube-api";
import { configMapApiInjectable } from "@k8slens/kube-api-specifics";
import type { PodVolumeVariantSpecificProps } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

interface Dependencies {
  configMapApi: ConfigMapApi;
}

const NonInjectedConfigMap = (props: PodVolumeVariantSpecificProps<"configMap"> & Dependencies) => {
  const {
    pod,
    variant: { name },
    configMapApi,
  } = props;

  return (
    <LocalRef
      pod={pod}
      title="Name"
      kubeRef={{ name }}
      api={configMapApi}
    />
  );
};

export const ConfigMap = withInjectables<Dependencies, PodVolumeVariantSpecificProps<"configMap">>(NonInjectedConfigMap, {
  getProps: (di, props) => ({
    ...props,
    configMapApi: di.inject(configMapApiInjectable),
  }),
});
