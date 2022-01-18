/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { PortForwardDialogModel } from "./port-forward-dialog-model";

const portForwardDialogModelInjectable = getInjectable({
  instantiate: () => new PortForwardDialogModel(),
  lifecycle: lifecycleEnum.singleton,
});

export default portForwardDialogModelInjectable;
