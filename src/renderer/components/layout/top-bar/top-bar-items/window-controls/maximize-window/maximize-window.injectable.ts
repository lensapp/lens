/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { WindowAction } from "../../../../../../../common/ipc/window";
import { requestWindowAction } from "../../../../../../ipc";

const maximizeWindowInjectable = getInjectable({
  id: "maximize-window",
  instantiate: () => () => requestWindowAction(WindowAction.MINIMIZE),
  causesSideEffects: true,
});

export default maximizeWindowInjectable;
