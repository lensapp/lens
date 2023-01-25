/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ConfirmDialogBooleanParams } from "./confirm-dialog";
import openConfirmDialogInjectable from "./open.injectable";

export type Confirm = (params: ConfirmDialogBooleanParams) => Promise<boolean>;

const confirmInjectable = getInjectable({
  id: "confirm",
  instantiate: (di): Confirm => {
    const open = di.inject(openConfirmDialogInjectable);

    return (params) => new Promise(resolve => {
      open({
        ok: () => resolve(true),
        cancel: () => resolve(false),
        ...params,
      });
    });
  },
});

export default confirmInjectable;
