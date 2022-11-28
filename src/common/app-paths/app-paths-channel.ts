/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AppPaths } from "./app-path-injection-token";
import type { RequestChannel } from "../utils/channel/request-channel-listener-injection-token";

export type AppPathsChannel = RequestChannel<void, AppPaths>;

export const appPathsChannel: AppPathsChannel = {
  id: "app-paths",
};

