/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequestChannel } from "../utils/channel/request-channel-listener-injection-token";

// This channel retreives the value needed to grant authentication to requests
export const lensAuthenticationChannel: RequestChannel<void, string> = {
  id: "lens-authentication-channel",
};
