/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { memoize } from "lodash";
import getElementByIdInjectable from "../../../utils/get-element-by-id.injectable";

/**
 * It is necessary to have this a function because in a testing environment the DOM isn't
 * available until after first render
 */
const terminalSpawningPoolInjectable = getInjectable({
  id: "terminal-spawning-pool",
  instantiate: (di) => {
    const getElementById = di.inject(getElementByIdInjectable);

    return memoize(() => getElementById("terminal-init"));
  },
});

export default terminalSpawningPoolInjectable;
