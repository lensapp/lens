/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { KubeconfigDialogData } from "./kubeconfig-dialog";

const kubeconfigDialogStateInjectable = getInjectable({
  id: "kubeconfig-dialog-state",
  instantiate: () => observable.box<KubeconfigDialogData>(),
});

export default kubeconfigDialogStateInjectable;
