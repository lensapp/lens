/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { bind } from "../../utils";
import type { ServiceAccountCreateDialogState } from "./create-dialog.state.injectable";
import ServiceAccountCreateDialogStateInjectable from "./create-dialog.state.injectable";

interface Dependencies {
  state: ServiceAccountCreateDialogState;
}

function openCreateServiceAccountDialog({ state }: Dependencies): void {
  runInAction(() => {
    state.isOpen = true;
  });
}

const openCreateServiceAccountDialogInjectable = getInjectable({
  instantiate: (di) => bind(openCreateServiceAccountDialog, null, {
    state: di.inject(ServiceAccountCreateDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openCreateServiceAccountDialogInjectable;
