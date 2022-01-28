/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../utils";
import type { StatefulSetScaleDialogState } from "./scale-dialog.state.injectable";
import statefulSetScaleDialogStateInjectable from "./scale-dialog.state.injectable";

interface Dependencies {
  statefulSetScaleDialogState: StatefulSetScaleDialogState;
}

function closeStatefulSetScaleDialog({ statefulSetScaleDialogState }: Dependencies): void {
  statefulSetScaleDialogState.statefulSet = null;
}

const closeStatefulSetDialogScaleInjectable = getInjectable({
  instantiate: (di) => bind(closeStatefulSetScaleDialog, null, {
    statefulSetScaleDialogState: di.inject(statefulSetScaleDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeStatefulSetDialogScaleInjectable;
