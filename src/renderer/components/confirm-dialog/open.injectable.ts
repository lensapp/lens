/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ConfirmDialogParams } from "./confirm-dialog";
import confirmDialogStateInjectable from "./state.injectable";

export type OpenConfirmDialog = (params: ConfirmDialogParams) => void;

const openConfirmDialogInjectable = getInjectable({
  id: "open-confirm-dialog",
  instantiate: (di): OpenConfirmDialog => {
    const state = di.inject(confirmDialogStateInjectable);

    return params => state.set(params);
  },
});

export default openConfirmDialogInjectable;
