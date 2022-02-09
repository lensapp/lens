/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { PathName } from "./app-path-names";
import { createChannel } from "../ipc-channel/create-channel/create-channel";

export type AppPaths = Record<PathName, string>;

export const appPathsInjectionToken = getInjectionToken<AppPaths>({ id: "app-paths-token" });

export const appPathsIpcChannel = createChannel<AppPaths>("app-paths");


