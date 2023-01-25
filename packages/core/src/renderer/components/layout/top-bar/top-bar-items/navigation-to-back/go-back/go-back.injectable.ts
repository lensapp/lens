/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { WindowAction } from "../../../../../../../common/ipc/window";
import { requestWindowAction } from "../../../../../../ipc";

const goBackInjectable = getInjectable({
  id: "go-back",
  instantiate: () => () => requestWindowAction(WindowAction.GO_BACK),
  causesSideEffects: true,
});

export default goBackInjectable;
