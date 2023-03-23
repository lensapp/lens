/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { MessageChannel } from "@k8slens/messaging";

export type RootFrameHasRenderedChannel = MessageChannel<void>;

export const rootFrameHasRenderedChannel: RootFrameHasRenderedChannel = {
  id: "root-frame-rendered",
};
