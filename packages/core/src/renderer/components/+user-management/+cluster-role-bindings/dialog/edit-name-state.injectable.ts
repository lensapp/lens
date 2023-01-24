/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const editClusterRoleBindingNameStateInjectable = getInjectable({
  id: "edit-cluster-role-binding-name-state",
  instantiate: () => observable.box(""),
});

export default editClusterRoleBindingNameStateInjectable;
