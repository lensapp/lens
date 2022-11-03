/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import { reaction } from "mobx";
import observableHistoryInjectable from "../navigation/observable-history.injectable";
import emitWindowLocationChangedInjectable from "../../features/window-location/renderer/emit.injectable";

const watchHistoryStateInjectable = getInjectable({
  id: "watch-history-state",

  instantiate: (di) => {
    const observableHistory = di.inject(observableHistoryInjectable);
    const emitWindowLocationChanged = di.inject(emitWindowLocationChangedInjectable);

    return () => reaction(
      () => observableHistory.location,
      emitWindowLocationChanged,
    );
  },
});

export default watchHistoryStateInjectable;
