/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntityData, CatalogEntityKindData } from "../../../../common/catalog";
import type { MessageChannel } from "../../../../common/utils/channel/message-channel-listener-injection-token";

export const currentCatalogEntityRegistryStateChannel: MessageChannel<(CatalogEntityData & CatalogEntityKindData)[]> = {
  id: "current-catalog-entity-registry-state",
};
