/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageChannel } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import type { CatalogEntityData, CatalogEntityKindData } from "../../../../common/catalog/catalog-entity";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-listener-injection-token";

export type RawCatalogEntityData = CatalogEntityData & CatalogEntityKindData;

export const catalogEntityUpdatesChannel: MessageChannel<RawCatalogEntityData[]> = {
  id: "catalog-entity-updates",
};

export const catalogInitialEntitiesChannel: RequestChannel<void, RawCatalogEntityData[]> = {
  id: "catalog-initial-entities",
};
