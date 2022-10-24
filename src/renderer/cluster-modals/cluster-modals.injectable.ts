/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { clusterModalsInjectionToken } from "./cluster-modals-injection-token";

const clusterModalsInjectable = getInjectable({
  id: "cluster-modals",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const modalRegistrations = computedInjectMany(clusterModalsInjectionToken);
    
    return modalRegistrations;
  },
});

export default clusterModalsInjectable;
