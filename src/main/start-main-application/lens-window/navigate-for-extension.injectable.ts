/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { iter } from "../../../common/utils";
import clusterFramesInjectable from "../../../common/cluster-frames.injectable";
import showApplicationWindowInjectable from "./show-application-window.injectable";
import applicationWindowInjectable from "./application-window/application-window.injectable";

export type NavigateForExtension = (
  extId: string,
  pageId?: string,
  params?: Record<string, any>,
  frameId?: number
) => Promise<void>;

const navigateForExtensionInjectable = getInjectable({
  id: "navigate-for-extension",

  instantiate: (di): NavigateForExtension => {
    const applicationWindow = di.inject(applicationWindowInjectable);
    const clusterFrames = di.inject(clusterFramesInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);

    return async (
      extId: string,
      pageId?: string,
      params?: Record<string, any>,
      frameId?: number,
    ) => {
      await showApplicationWindow();

      const frameInfo = iter.find(
        clusterFrames.values(),
        (frameInfo) => frameInfo.frameId === frameId,
      );

      await applicationWindow.send({
        channel: "extension:navigate",
        frameInfo,
        data: [extId, pageId, params],
      });
    };
  },
});

export default navigateForExtensionInjectable;
