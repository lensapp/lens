/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Agent } from "https";
import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import websocketAgentInjectable from "./websocket-agent.injectable";

export default getGlobalOverride(websocketAgentInjectable, () => new Agent({
  rejectUnauthorized: false,
}));
