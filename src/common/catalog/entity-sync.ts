/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequireAtLeastOne } from "type-fest";
import type { CatalogEntityData } from "./catalog-entity";

export interface EntityChangeEvents {
  add: (data: RawCatalogEntity) => void;
  update: (uid: string, data: RawCatalogEntityUpdate) => void;
  delete: (uid: string) => void;
}

export interface RawCatalogEntity extends CatalogEntityData {
  kind: string;
  apiVersion: string;
}

export type RawCatalogEntityUpdate = RequireAtLeastOne<CatalogEntityData>;

export interface CatalogSyncAddMessage {
  type: "add";
  data: RawCatalogEntity;
}

export interface CatalogSyncUpdateMessage {
  type: "update",
  uid: string;
  data: RawCatalogEntityUpdate;
}

export interface CatalogSyncDeleteMessage {
  type: "delete",
  uid: string;
}

export type CatalogSyncMessage = CatalogSyncAddMessage | CatalogSyncUpdateMessage | CatalogSyncDeleteMessage;
