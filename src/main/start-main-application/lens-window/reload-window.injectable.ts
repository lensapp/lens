/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { LensWindow } from "./application-window/lens-window-injection-token";
import { IpcRendererNavigationEvents } from "../../../renderer/navigation/events";
import currentClusterFrameInjectable from "./current-cluster-frame/current-cluster-frame.injectable";
import reloadAllWindowsInjectable from "./reload-all-windows.injectable";

const reloadWindowInjectable = getInjectable({
  id: "reload-window",

  instantiate: (di, lensWindow: LensWindow) => () => {
    const currentClusterIframe = di.inject(currentClusterFrameInjectable);
    const reloadAllWindows = di.inject(reloadAllWindowsInjectable);

    const frameInfo = currentClusterIframe.get();

    if (frameInfo) {
      lensWindow.send({
        channel: IpcRendererNavigationEvents.RELOAD_PAGE,
        frameInfo,
      });
    } else {
      reloadAllWindows();
    }
  },

  lifecycle: lifecycleEnum.transient,
});

export default reloadWindowInjectable;
