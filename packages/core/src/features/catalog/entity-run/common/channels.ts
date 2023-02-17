/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * These channels are seperated so that the `main` environment can be used as a launchpad between
 * `renderer` environments (iframes)
 */

import type { MessageChannel } from "../../../../common/utils/channel/message-channel-listener-injection-token";

export const runCatalogEntityChannel: MessageChannel<string> = {
  id: "run-catalog-entity",
};

export const runCatalogEntityMainFrameChannel: MessageChannel<string> = {
  id: "run-catalog-entity-main-frame",
};
