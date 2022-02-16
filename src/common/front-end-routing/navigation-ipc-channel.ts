/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createChannel } from "../ipc-channel/create-channel/create-channel";
import { IpcRendererNavigationEvents } from "../../renderer/navigation/events";

export const appNavigationIpcChannel = createChannel<string>(IpcRendererNavigationEvents.NAVIGATE_IN_APP);
export const clusterFrameNavigationIpcChannel = createChannel<string>(IpcRendererNavigationEvents.NAVIGATE_IN_CLUSTER);
