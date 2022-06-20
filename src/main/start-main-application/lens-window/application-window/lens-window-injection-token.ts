/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterFrameInfo } from "../../../../common/cluster-frames";

export interface SendToViewArgs {
  channel: string;
  frameInfo?: ClusterFrameInfo;
  data?: unknown[];
}

export interface LensWindow {
  id: string;
  start: () => Promise<void>;
  close: () => void;
  show: () => void;
  send: (args: SendToViewArgs) => void;
  isVisible: boolean;
  isStarting: boolean;
}

export const lensWindowInjectionToken = getInjectionToken<LensWindow>({
  id: "lens-window",
});
