/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequestChannel } from "../../../common/utils/channel/request-channel-listener-injection-token";

export const lensProxyPortChannel: RequestChannel<void, number> = {
  id: "lens-proxy-port",
};
