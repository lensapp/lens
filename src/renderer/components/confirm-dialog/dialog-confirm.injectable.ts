/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../utils";
import type { ConfirmDialogBooleanParams, ConfirmDialogParams } from "./confirm-dialog";
import openConfirmDialogInjectable from "./dialog-open.injectable";

interface Dependencies {
  openConfirmDialog: (params: ConfirmDialogParams) => void
}

function confirmWithDialog({ openConfirmDialog }: Dependencies, params: ConfirmDialogBooleanParams): Promise<boolean> {
  return new Promise(resolve => {
    openConfirmDialog({
      ...params,
      ok: () => resolve(true),
      cancel: () => resolve(false),
    });
  });
}

const confirmWithDialogInjectable = getInjectable({
  instantiate: (di) => bind(confirmWithDialog, null, {
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default confirmWithDialogInjectable;
