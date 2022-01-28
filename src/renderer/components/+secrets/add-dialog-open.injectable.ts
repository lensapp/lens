/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AddSecretDialogState } from "./add-dialog.state.injectable";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../utils";
import addSecretDialogStateInjectable from "./add-dialog.state.injectable";

interface Dependencies {
  addSecretDialogState: AddSecretDialogState;
}

function openAddSecretDialog({ addSecretDialogState }: Dependencies) {
  addSecretDialogState.isOpen = true;
}

const openAddSecretDialogInjectable = getInjectable({
  instantiate: (di) => bind(openAddSecretDialog, null, {
    addSecretDialogState: di.inject(addSecretDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openAddSecretDialogInjectable;

