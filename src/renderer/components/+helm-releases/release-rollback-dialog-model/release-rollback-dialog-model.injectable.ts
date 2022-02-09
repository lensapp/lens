/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ReleaseRollbackDialogModel } from "./release-rollback-dialog-model";

const releaseRollbackDialogModelInjectable = getInjectable({
  id: "release-rollback-dialog-model",
  instantiate: () => new ReleaseRollbackDialogModel(),
  lifecycle: lifecycleEnum.singleton,
});

export default releaseRollbackDialogModelInjectable;
