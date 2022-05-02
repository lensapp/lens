/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterFrameInfo } from "../../../../common/cluster-frames";

export interface SendToViewArgs {
  channel: string;
  frameInfo?: ClusterFrameInfo;
  data?: any[];
}

export interface LensWindow {
  show: () => Promise<void>;
  hide: () => void;
  close: () => void;
  send: (args: SendToViewArgs) => Promise<void>;
}

export const lensWindowInjectionToken = getInjectionToken<LensWindow>({
  id: "lens-window",
});
