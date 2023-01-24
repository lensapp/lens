/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ConfirmDialogParams } from "./confirm-dialog";
import { getInjectable } from "@ogre-tools/injectable";
import openConfirmDialogInjectable from "./open.injectable";

export type WithConfirmation = (params: ConfirmDialogParams) => () => void;

const withConfirmationInjectable = getInjectable({
  id: "with-confirmation",
  instantiate: (di): WithConfirmation => {
    const open = di.inject(openConfirmDialogInjectable);

    return (params) => () => open(params);
  },
});

export default withConfirmationInjectable;
