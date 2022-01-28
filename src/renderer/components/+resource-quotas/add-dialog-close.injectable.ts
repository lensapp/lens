/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AddResourceQuotaDialogState } from "./add-dialog.state.injectable";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../utils";
import addResourceQuotaDialogStateInjectable from "./add-dialog.state.injectable";

interface Dependencies {
  addResourceQuotaDialogState: AddResourceQuotaDialogState;
}

function closeAddResourceQuotaDialog({ addResourceQuotaDialogState }: Dependencies) {
  addResourceQuotaDialogState.isOpen = false;
}

const closeAddResourceQuotaDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeAddResourceQuotaDialog, null, {
    addResourceQuotaDialogState: di.inject(addResourceQuotaDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeAddResourceQuotaDialogInjectable;

