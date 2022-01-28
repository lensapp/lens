/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../utils";
import type { ConfirmDialogParams } from "./confirm-dialog";
import type { ConfirmDialogState } from "./dialog.state.injectable";
import confirmDialogStateInjectable from "./dialog.state.injectable";

interface Dependencies {
  confirmDialogState: ConfirmDialogState;
}

function openConfirmDialog({ confirmDialogState }: Dependencies, params: ConfirmDialogParams): void {
  confirmDialogState.params = params;
}

const openConfirmDialogInjectable = getInjectable({
  instantiate: (di) => bind(openConfirmDialog, null, {
    confirmDialogState: di.inject(confirmDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openConfirmDialogInjectable;
