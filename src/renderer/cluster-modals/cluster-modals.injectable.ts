/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { flatMap } from "lodash/fp";
import type { IComputedValue } from "mobx";
import type { ClusterModalRegistration } from "../../extensions/registries";
import { clusterModalsInjectionToken } from "../../extensions/registries";

const clusterModalsInjectable = getInjectable({
  id: "cluster-modals",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    const modalRegistrations = computedInjectMany(clusterModalsInjectionToken);
    const registrations = pipeline(
      modalRegistrations.get(),
      flatMap(dereference),
    );

    return registrations;
  },
});

const dereference = (items: IComputedValue<ClusterModalRegistration[]>) =>
  items.get();

export default clusterModalsInjectable;
