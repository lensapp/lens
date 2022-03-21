/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { pvcApi } from "../../../../../../common/k8s-api/endpoints";
import { LocalRef, VolumeVariantComponent } from "../variant-helpers";

export const PersistentVolumeClaim: VolumeVariantComponent<"persistentVolumeClaim"> = (
  ({ pod, variant: { claimName }}) => (
    <LocalRef
      pod={pod}
      title="Name"
      kubeRef={{ name: claimName }}
      api={pvcApi}
    />
  )
);
