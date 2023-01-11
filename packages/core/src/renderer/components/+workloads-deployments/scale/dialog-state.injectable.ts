/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { Deployment } from "../../../../common/k8s-api/endpoints";

const deploymentScaleDialogStateInjectable = getInjectable({
  id: "deployment-scale-dialog-state",
  instantiate: () => observable.box<Deployment | undefined>(),
});

export default deploymentScaleDialogStateInjectable;
