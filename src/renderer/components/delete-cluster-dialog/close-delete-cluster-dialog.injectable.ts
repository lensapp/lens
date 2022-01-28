/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { action } from "mobx";
import { bind } from "../../utils";
import deleteClusterDialogStateInjectable, { DeleteClusterDialogState } from "./state.injectable";

interface Dependencies {
  state: DeleteClusterDialogState;
}

const closeDeleteClusterDialog = action(({ state }: Dependencies): void => {
  state.cluster = undefined;
  state.config = undefined;
});

const closeDeleteClusterDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeDeleteClusterDialog, null, {
    state: di.inject(deleteClusterDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeDeleteClusterDialogInjectable;
