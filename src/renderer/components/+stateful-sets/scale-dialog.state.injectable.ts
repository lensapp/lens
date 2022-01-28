/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { StatefulSet } from "../../../common/k8s-api/endpoints";

export interface StatefulSetScaleDialogState {
  statefulSet: StatefulSet | null;
}

const statefulSetScaleDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<StatefulSetScaleDialogState>({
    statefulSet: null,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default statefulSetScaleDialogStateInjectable;
