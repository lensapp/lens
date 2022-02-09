/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { AddNamespaceDialogModel } from "./add-namespace-dialog-model";

const addNamespaceDialogModelInjectable = getInjectable({
  id: "add-namespace-dialog-model",
  instantiate: () => new AddNamespaceDialogModel(),
});

export default addNamespaceDialogModelInjectable;
