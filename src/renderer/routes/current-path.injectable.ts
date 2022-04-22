/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import observableHistoryInjectable from "../navigation/history/observable.injectable";

const currentPathInjectable = getInjectable({
  id: "current-path",

  instantiate: (di) => {
    const observableHistory = di.inject(observableHistoryInjectable);

    return computed(() => observableHistory.location.pathname);
  },
});

export default currentPathInjectable;
