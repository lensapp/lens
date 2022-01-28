/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { createPageParam } from "../../../navigation";

const crdGroupsUrlParamInjectable = getInjectable({
  instantiate: () => createPageParam<string[]>({
    name: "groups",
    defaultValue: [],
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default crdGroupsUrlParamInjectable;
