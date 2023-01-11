/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type React from "react";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";

export type IsMultiSelectionKey = (event: React.KeyboardEvent) => boolean;

const isMultiSelectionKeyInjectable = getInjectable({
  id: "is-multi-selection-key",
  instantiate: (di): IsMultiSelectionKey => {
    const isMac = di.inject(isMacInjectable);

    return isMac
      ? ({ key }) => key === "Meta"
      : ({ key }) => key === "Control";
  },
});

export default isMultiSelectionKeyInjectable;
