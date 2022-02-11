/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { format } from "url";
import type { CatalogSyncMessage, EntityChangeEvents } from "../../common/catalog/entity-sync";
import logger from "../../common/logger";
import { apiPrefix, catalogSyncRoute } from "../../common/vars";
import { WebSocketApi } from "./websocket-api";

export function startCatalogEntitySync(events: EntityChangeEvents): void {
  const { hostname, protocol, port } = location;

  const socketUrl = format({
    protocol: protocol.includes("https") ? "wss" : "ws",
    hostname,
    port,
    pathname: `${apiPrefix}${catalogSyncRoute}`,
    slashes: true,
  });

  const api = new WebSocketApi();

  api.on("data", (message) => {
    const change = JSON.parse(message) as CatalogSyncMessage;

    logger.silly(`[CATALOG-SYNC]: event`, change);

    switch (change.type) {
      case "add":
        return events.add(change.data);
      case "update":
        return events.update(change.uid, change.data);
      case "delete":
        return events.delete(change.uid);
    }
  });

  api.connect(socketUrl);
}
