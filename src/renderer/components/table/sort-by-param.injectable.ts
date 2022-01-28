/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { createPageParam } from "../../navigation";

const sortByUrlParamInjectable = getInjectable({
  instantiate: () => createPageParam({
    name: "sort",
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default sortByUrlParamInjectable;
