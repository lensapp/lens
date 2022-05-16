/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import showDetailsInjectable from "./show-details.injectable";

export type HideDetails = () => void;

const hideDetailsInjectable = getInjectable({
  id: "hide-details",
  instantiate: (di): HideDetails => {
    const showDetails = di.inject(showDetailsInjectable);

    return () => showDetails("");
  },
});

export default hideDetailsInjectable;
