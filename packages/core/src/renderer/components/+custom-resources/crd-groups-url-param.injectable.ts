/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createPageParamInjectable from "../../navigation/create-page-param.injectable";

const crdGroupsUrlParamInjectable = getInjectable({
  id: "crd-groups-url-param",
  instantiate: (di) => {
    const createPageParam = di.inject(createPageParamInjectable);

    return createPageParam<string[]>({
      name: "groups",
      defaultValue: [],
    });
  },
});

export default crdGroupsUrlParamInjectable;
