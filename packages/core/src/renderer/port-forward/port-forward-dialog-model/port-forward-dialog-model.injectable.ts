/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { PortForwardDialogModel } from "./port-forward-dialog-model";

const portForwardDialogModelInjectable = getInjectable({
  id: "port-forward-dialog-model",
  instantiate: () => new PortForwardDialogModel(),
});

export default portForwardDialogModelInjectable;
