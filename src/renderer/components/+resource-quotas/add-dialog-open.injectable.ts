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

function openAddResourceQuotaDialog({ addResourceQuotaDialogState }: Dependencies) {
  addResourceQuotaDialogState.isOpen = true;
}

const openAddResourceQuotaDialogInjectable = getInjectable({
  instantiate: (di) => bind(openAddResourceQuotaDialog, null, {
    addResourceQuotaDialogState: di.inject(addResourceQuotaDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openAddResourceQuotaDialogInjectable;

