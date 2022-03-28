/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { configMapApi } from "../../../../../../common/k8s-api/endpoints";
import { LocalRef, VolumeVariantComponent } from "../variant-helpers";

export const ConfigMap: VolumeVariantComponent<"configMap"> = (
  ({ pod, variant: { name }}) => (
    <LocalRef
      pod={pod}
      title="Name"
      kubeRef={{ name }}
      api={configMapApi}
    />
  )
);
