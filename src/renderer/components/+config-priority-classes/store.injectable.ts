/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import priorityClassApiInjectable from "../../../common/k8s-api/endpoints/priority-class.api.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { PriorityClassStore } from "./store";

const priorityClassStoreInjectable = getInjectable({
  id: "priority-class-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "priorityClassStore is only available in certain environments");

    const api = di.inject(priorityClassApiInjectable);

    return new PriorityClassStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default priorityClassStoreInjectable;
