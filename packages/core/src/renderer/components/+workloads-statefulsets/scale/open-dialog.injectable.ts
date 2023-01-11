/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { StatefulSet } from "../../../../common/k8s-api/endpoints";
import { getInjectable } from "@ogre-tools/injectable";
import statefulSetDialogStateInjectable from "./dialog-state.injectable";

export type OpenStatefulSetScaleDialog = (obj: StatefulSet) => void;

const openStatefulSetScaleDialogInjectable = getInjectable({
  id: "open-stateful-set-scale-dialog",
  instantiate: (di): OpenStatefulSetScaleDialog => {
    const state = di.inject(statefulSetDialogStateInjectable);

    return (obj) => state.set(obj);
  },
});

export default openStatefulSetScaleDialogInjectable;
