/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createPageParamInjectable from "../../navigation/create-page-param.injectable";

const selectedCustomResourceDefinitionGroupsUrlParamInjectable = getInjectable({
  id: "crd-groups-url-param",
  instantiate: (di) => {
    const createPageParam = di.inject(createPageParamInjectable);

    return createPageParam({
      name: "groups",
      defaultValue: new Set<string>(),
      parse: (value: string[]) => new Set<string>(value),
      stringify: (value) => Array.from(value),
    });
  },
});

export default selectedCustomResourceDefinitionGroupsUrlParamInjectable;
