/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../../../common/test-utils/get-global-override";
import { reloadPageChannel } from "../common/channel";
import reloadPageChannelListenerInjectable from "./register-listener.injectable";

export default getGlobalOverride(reloadPageChannelListenerInjectable, () => ({
  channel: reloadPageChannel,
  handler: () => {},
}));
