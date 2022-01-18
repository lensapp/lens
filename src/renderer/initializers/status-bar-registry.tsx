/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { StatusBarRegistry } from "../../extensions/registries";
import { ActiveHotbarName } from "../components/cluster-manager/active-hotbar-name";

export function initStatusBarRegistry() {
  StatusBarRegistry.getInstance().add([
    {
      components: {
        Item: () => <ActiveHotbarName/>,
        position: "left",
      },
    },
  ]);
}
