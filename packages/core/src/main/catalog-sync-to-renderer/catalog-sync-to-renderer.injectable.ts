/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { getStartableStoppable } from "../../common/utils/get-startable-stoppable";
import catalogEntityChangeSetInjectable from "../../features/catalog/sync/main/entity-change-set.injectable";
import entityUpdateBroadcasterInjectable from "../../features/catalog/sync/main/entity-update-broadcaster.injectable";

const catalogSyncToRendererInjectable = getInjectable({
  id: "catalog-sync-to-renderer",

  instantiate: (di) => {
    const catalogEntityChangeSet = di.inject(catalogEntityChangeSetInjectable);
    const entityUpdateBroadcaster = di.inject(entityUpdateBroadcasterInjectable);

    return getStartableStoppable("catalog-sync", () => (
      reaction(
        () => catalogEntityChangeSet.get(),
        entityUpdateBroadcaster,
        {
          fireImmediately: true,
        },
      )
    ));
  },
});

export default catalogSyncToRendererInjectable;
