/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { WindowAction } from "../../../../../common/ipc/window";
import { requestWindowAction } from "../../../../ipc";

const toggleMaximizeWindowInjectable = getInjectable({
  id: "toggle-maximize-window",
  instantiate: () => () => requestWindowAction(WindowAction.TOGGLE_MAXIMIZE),
  causesSideEffects: true,
});

export default toggleMaximizeWindowInjectable;
