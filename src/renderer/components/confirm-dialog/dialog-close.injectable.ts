/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../utils";
import type { ConfirmDialogState } from "./dialog.state.injectable";
import confirmDialogStateInjectable from "./dialog.state.injectable";

interface Dependencies {
  confirmDialogState: ConfirmDialogState;
}

function closeConfirmDialog({ confirmDialogState }: Dependencies): void {
  confirmDialogState.params = null;
}

const closeConfirmDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeConfirmDialog, null, {
    confirmDialogState: di.inject(confirmDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeConfirmDialogInjectable;
