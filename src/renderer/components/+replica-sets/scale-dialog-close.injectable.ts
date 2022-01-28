/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../utils";
import type { ReplicaSetScaleDialogState } from "./scale-dialog.state.injectable";
import replicaSetScaleDialogStateInjectable from "./scale-dialog.state.injectable";

interface Dependencies {
  replicasetScaleDialogState: ReplicaSetScaleDialogState;
}

function closeReplicaSetScaleDialog({ replicasetScaleDialogState }: Dependencies): void {
  replicasetScaleDialogState.replicaSet = null;
}

const closeReplicaSetScaleDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeReplicaSetScaleDialog, null, {
    replicasetScaleDialogState: di.inject(replicaSetScaleDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeReplicaSetScaleDialogInjectable;
