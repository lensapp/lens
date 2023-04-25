/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import { emitWindowLocationChanged } from "../ipc";
import { reaction } from "mobx";
import { observableHistoryInjectionToken } from "@k8slens/routing";

const watchHistoryStateInjectable = getInjectable({
  id: "watch-history-state",

  instantiate: (di) => {
    const observableHistory = di.inject(observableHistoryInjectionToken);

    return () => reaction(
      () => observableHistory.location,
      emitWindowLocationChanged,
    );
  },

  causesSideEffects: true,
});

export default watchHistoryStateInjectable;
