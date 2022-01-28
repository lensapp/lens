/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";

export interface ReplicaSetScaleDialogState {
  replicaSet: ReplicaSet | null;
}

const replicaSetScaleDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<ReplicaSetScaleDialogState>({
    replicaSet: null,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default replicaSetScaleDialogStateInjectable;
