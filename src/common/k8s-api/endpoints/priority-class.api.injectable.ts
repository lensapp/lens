/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { PriorityClassApi } from "./priority-class.api";

const priorityClassApiInjectable = getInjectable({
  id: "priority-class-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "PriorityClassApi is only available in certain environments");

    return new PriorityClassApi();
  },
});

export default priorityClassApiInjectable;
