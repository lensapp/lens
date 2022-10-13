/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequestChannel } from "../../../common/utils/channel/request-channel-listener-injection-token";

export interface ShellApiAuthArgs {
  clusterId: string;
  tabId: string;
}

export type ShellApiAuthChannel = RequestChannel<ShellApiAuthArgs, Uint8Array>;

export const shellApiAuthChannel: ShellApiAuthChannel = {
  id: "cluster-shell-api-auth",
};
