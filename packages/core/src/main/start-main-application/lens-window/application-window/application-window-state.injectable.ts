/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import windowStateKeeper from "electron-window-state";

interface WindowStateConfiguration {
  id: string;
  defaultHeight: number;
  defaultWidth: number;
}

const applicationWindowStateInjectable = getInjectable({
  id: "application-window-state",

  instantiate: (di, { id, defaultHeight, defaultWidth }) => windowStateKeeper({
    defaultHeight,
    defaultWidth,
    file: `window-state-for-${id}.json`,
  }),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, { id }: WindowStateConfiguration) => id,
  }),
});

export default applicationWindowStateInjectable;
