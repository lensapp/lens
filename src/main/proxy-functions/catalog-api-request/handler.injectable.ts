/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { isEqual } from "lodash";
import { autorun, IComputedValue } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import { toJS } from "../../../renderer/utils";
import catalogEntitiesInjectable from "../../catalog/entities.injectable";
import type { ProxyApiRequestArgs } from "../types";
import WebSocket, { Server as WebSocketServer } from "ws";
import logger from "../../logger";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";
import type { RawCatalogEntity, RawCatalogEntityUpdate, EntityChangeEvents, CatalogSyncAddMessage, CatalogSyncDeleteMessage, CatalogSyncUpdateMessage } from "../../../common/catalog/entity-sync";

interface Dependencies {
  entities: IComputedValue<CatalogEntity[]>;
}

function toRaw(entity: CatalogEntity): RawCatalogEntity {
  return {
    kind: entity.kind,
    apiVersion: entity.apiVersion,
    metadata: toJS(entity.metadata),
    status: toJS(entity.status),
    spec: toJS(entity.spec),
  };
}

function createRawEntityUpdate(prevRaw: RawCatalogEntity, rawEntity: RawCatalogEntity): RawCatalogEntityUpdate | false {
  const metadata = isEqual(prevRaw.metadata, rawEntity.metadata)
    ? {}
    : { metadata: rawEntity.metadata };
  const status = isEqual(prevRaw.status, rawEntity.status)
    ? {}
    : { status: rawEntity.status };
  const spec = isEqual(prevRaw.spec, rawEntity.spec)
    ? {}
    : { spec: rawEntity.spec };
  const res = {
    ...metadata,
    ...status,
    ...spec,
  };

  if (!res.metadata && !res.spec && !res.status) {
    return false;
  }

  return res as RawCatalogEntityUpdate;
}

function wrapWebsocketForChangeEvents(websocket: WebSocket): EntityChangeEvents {
  return {
    add: (data) => {
      websocket.send(JSON.stringify({
        data,
        type: "add",
      } as CatalogSyncAddMessage));
    },
    delete: (uid) => {
      websocket.send(JSON.stringify({
        uid,
        type: "delete",
      } as CatalogSyncDeleteMessage));
    },
    update: (uid, data) => {
      websocket.send(JSON.stringify({
        uid,
        data,
        type: "update",
      } as CatalogSyncUpdateMessage));
    },
  };
}

const catalogApiRequestHandler = ({ entities }: Dependencies) => {
  const rawEntityMap = new Map<string, RawCatalogEntity>();
  const entityChangeEmitter = new EventEmitter() as TypedEventEmitter<EntityChangeEvents>;

  autorun(() => {
    const currentIds = new Set<string>();

    for (const entity of entities.get()) {
      currentIds.add(entity.getId());

      const rawEntity = toRaw(entity);

      if (rawEntityMap.has(rawEntity.metadata.uid)) {
        const prevRaw = rawEntityMap.get(rawEntity.metadata.uid);
        const diff = createRawEntityUpdate(prevRaw, rawEntity);

        if (diff) {
          rawEntityMap.set(rawEntity.metadata.uid, rawEntity);
          entityChangeEmitter.emit("update", rawEntity.metadata.uid, diff);
        }
      } else {
        rawEntityMap.set(rawEntity.metadata.uid, rawEntity);
        entityChangeEmitter.emit("add", rawEntity);
      }
    }

    for (const rawEntityId of rawEntityMap.keys()) {
      if (!currentIds.has(rawEntityId)) {
        rawEntityMap.delete(rawEntityId);
        entityChangeEmitter.emit("delete", rawEntityId);
      }
    }
  });

  return async ({ req, socket, head }: ProxyApiRequestArgs): Promise<void> => {
    const ws = new WebSocketServer({ noServer: true });

    return ws.handleUpgrade(req, socket, head, (websocket) => {
      logger.info("[CATALOG-SYNC]: starting new catalog entity sync");
      const events = wrapWebsocketForChangeEvents(websocket);

      for (const rawEntity of rawEntityMap.values()) {
        // initialize with current values
        events.add(rawEntity);
      }

      // Set up passing changes on
      entityChangeEmitter.on("add", events.add);
      entityChangeEmitter.on("update", events.update);
      entityChangeEmitter.on("delete", events.delete);

      websocket.on("close", () => {
        entityChangeEmitter.off("add", events.add);
        entityChangeEmitter.off("update", events.update);
        entityChangeEmitter.off("delete", events.delete);
      });
    });
  };
};

const catalogApiRequestHandlerInjectable = getInjectable({
  instantiate: (di) => catalogApiRequestHandler({
    entities: di.inject(catalogEntitiesInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default catalogApiRequestHandlerInjectable;
