/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { DeleteClusterDialogModel } from "./delete-cluster-dialog-model";

const deleteClusterDialogModelInjectable = getInjectable({
  id: "delete-cluster-dialog-model",
  instantiate: () => new DeleteClusterDialogModel(),
});

export default deleteClusterDialogModelInjectable;
