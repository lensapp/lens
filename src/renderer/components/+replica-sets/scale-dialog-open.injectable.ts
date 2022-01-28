/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import { bind } from "../../utils";
import type { ReplicaSetScaleDialogState } from "./scale-dialog.state.injectable";
import replicaSetScaleDialogStateInjectable from "./scale-dialog.state.injectable";

interface Dependencies {
  replicasetScaleDialogState: ReplicaSetScaleDialogState;
}

function openReplicaSetScaleDialog({ replicasetScaleDialogState }: Dependencies, replicaset: ReplicaSet): void {
  replicasetScaleDialogState.replicaSet = replicaset;
}

const openReplicaSetScaleDialogInjectable = getInjectable({
  instantiate: (di) => bind(openReplicaSetScaleDialog, null, {
    replicasetScaleDialogState: di.inject(replicaSetScaleDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openReplicaSetScaleDialogInjectable;
