/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { KubeApiResourceDescriptor } from "../../../../common/rbac";

export const shouldShowResourceInjectionToken = getInjectionToken<IComputedValue<boolean>, KubeApiResourceDescriptor>({
  id: "should-show-resource",
});
