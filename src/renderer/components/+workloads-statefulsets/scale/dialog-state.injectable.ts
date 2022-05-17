/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { StatefulSet } from "../../../../common/k8s-api/endpoints";

const statefulSetDialogStateInjectable = getInjectable({
  id: "stateful-set-dialog-state",
  instantiate: () => observable.box<StatefulSet | undefined>(),
});

export default statefulSetDialogStateInjectable;
