/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { AppPaths } from "./app-paths";
import type { Channel } from "../communication/channel";

export type AppPathsChannel = Channel<[], AppPaths>;

export const appPathsInjectionChannelToken = getInjectionToken<AppPathsChannel>();
export const appPathsIpcChannel = "app-paths";
