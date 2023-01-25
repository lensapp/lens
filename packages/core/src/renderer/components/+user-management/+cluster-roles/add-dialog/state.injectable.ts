/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IObservableValue } from "mobx";
import { observable } from "mobx";

export interface AddClusterRoleDialogState {
  isOpen: IObservableValue<boolean>;
  clusterRoleName: IObservableValue<string>;
}

const addClusterRoleDialogStateInjectable = getInjectable({
  id: "add-cluster-role-dialog-open-state",
  instantiate: (): AddClusterRoleDialogState => ({
    clusterRoleName: observable.box(""),
    isOpen: observable.box(false),
  }),
});

export default addClusterRoleDialogStateInjectable;
