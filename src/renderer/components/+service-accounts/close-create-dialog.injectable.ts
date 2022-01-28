/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { bind } from "../../utils";
import type { ServiceAccountCreateDialogState } from "./create-dialog.state.injectable";
import ServiceAccountDialogStateInjectable from "./create-dialog.state.injectable";

interface Dependencies {
  state: ServiceAccountCreateDialogState;
}

function closeCreateServiceAccountDialog({ state }: Dependencies): void {
  runInAction(() => {
    state.isOpen = false;
  });
}

const closeCreateServiceAccountDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeCreateServiceAccountDialog, null, {
    state: di.inject(ServiceAccountDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeCreateServiceAccountDialogInjectable;
