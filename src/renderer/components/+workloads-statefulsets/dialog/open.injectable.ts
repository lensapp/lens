/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { StatefulSet } from "../../../../common/k8s-api/endpoints";
import { getInjectable } from "@ogre-tools/injectable";
import statefulSetDialogStateInjectable from "./state.injectable";

export type OpenStatefulSetDialog = (obj: StatefulSet) => void;

const openStatefulSetDialogInjectable = getInjectable({
  id: "open-stateful-set-dialog",
  instantiate: (di): OpenStatefulSetDialog => {
    const state = di.inject(statefulSetDialogStateInjectable);

    return (obj) => state.set(obj);
  },
});

export default openStatefulSetDialogInjectable;
