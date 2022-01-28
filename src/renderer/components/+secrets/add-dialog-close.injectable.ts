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

function closeAddSecretDialog({ addSecretDialogState }: Dependencies) {
  addSecretDialogState.isOpen = false;
}

const closeAddSecretDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeAddSecretDialog, null, {
    addSecretDialogState: di.inject(addSecretDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeAddSecretDialogInjectable;

