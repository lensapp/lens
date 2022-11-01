/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequestChannel } from "../../utils/channel/request-channel-listener-injection-token";

export const buildVersionChannel: RequestChannel<void, string> = {
  id: "build-version",
};
