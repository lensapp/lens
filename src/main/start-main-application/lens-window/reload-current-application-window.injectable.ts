/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { IpcRendererNavigationEvents } from "../../../renderer/navigation/events";
import currentClusterFrameInjectable from "./current-cluster-frame/current-cluster-frame.injectable";
import getCurrentApplicationWindowInjectable from "./application-window/get-current-application-window.injectable";

const reloadCurrentApplicationWindowInjectable = getInjectable({
  id: "reload-current-application-window",

  instantiate: (di) => {
    const getCurrentApplicationWindow = di.inject(getCurrentApplicationWindowInjectable);
    const currentClusterIframe = di.inject(currentClusterFrameInjectable);

    return () => {
      const lensWindow = getCurrentApplicationWindow();

      if (!lensWindow) {
        return;
      }

      const frameInfo = currentClusterIframe.get();

      if (frameInfo) {
        lensWindow.send({
          channel: IpcRendererNavigationEvents.RELOAD_PAGE,
          frameInfo,
        });
      } else {
        lensWindow.reload();
      }
    };
  },
});

export default reloadCurrentApplicationWindowInjectable;
