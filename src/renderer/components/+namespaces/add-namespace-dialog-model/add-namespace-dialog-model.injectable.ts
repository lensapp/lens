/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { AddNamespaceDialogModel } from "./add-namespace-dialog-model";

const addNamespaceDialogModelInjectable = getInjectable({
  instantiate: () => new AddNamespaceDialogModel(),
  lifecycle: lifecycleEnum.singleton,
});

export default addNamespaceDialogModelInjectable;
