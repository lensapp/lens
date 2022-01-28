/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StatefulSet } from "../../../common/k8s-api/endpoints";
import { bind } from "../../utils";
import type { StatefulSetScaleDialogState } from "./scale-dialog.state.injectable";
import statefulSetScaleDialogStateInjectable from "./scale-dialog.state.injectable";

interface Dependencies {
  statefulSetScaleDialogState: StatefulSetScaleDialogState;
}

function openStatefulSetScaleDialog({ statefulSetScaleDialogState }: Dependencies, statefulSet: StatefulSet): void {
  statefulSetScaleDialogState.statefulSet = statefulSet;
}

const openStatefulSetScaleDialogInjectable = getInjectable({
  instantiate: (di) => bind(openStatefulSetScaleDialog, null, {
    statefulSetScaleDialogState: di.inject(statefulSetScaleDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openStatefulSetScaleDialogInjectable;
