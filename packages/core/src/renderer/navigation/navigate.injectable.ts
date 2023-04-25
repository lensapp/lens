/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LocationDescriptor } from "history";
import { action } from "mobx";
import { observableHistoryInjectionToken } from "@k8slens/routing";
import { createPath } from "history";

export type Navigate = (location: LocationDescriptor) => void;

const navigateInjectable = getInjectable({
  id: "navigate",
  instantiate: (di): Navigate => {
    const observableHistory = di.inject(observableHistoryInjectionToken);

    return action((location) => {
      const currentLocation = createPath(observableHistory.location);

      observableHistory.push(location);

      const newLocation = createPath(observableHistory.location);

      if (currentLocation === newLocation) {
        observableHistory.goBack(); // prevent sequences of same url in history
      }
    });
  },
});

export default navigateInjectable;
