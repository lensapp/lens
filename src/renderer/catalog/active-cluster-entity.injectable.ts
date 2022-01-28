/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { CatalogEntity } from "../../common/catalog";
import getClusterByIdInjectable from "../../common/cluster-store/get-cluster-by-id.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import activeEntityInjectable from "./active-entity.injectable";

interface Dependencies {
  activeEntity: CatalogEntity | undefined | null;
  getClusterById: (id: string) => Cluster | null;
}

function activeClusterEntity({ activeEntity, getClusterById }: Dependencies): Cluster | undefined {
  return getClusterById(activeEntity?.getId());
}

const activeClusterEntityInjectable = getInjectable({
  instantiate: (di) => activeClusterEntity({
    activeEntity: di.inject(activeEntityInjectable).get(),
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
  lifecycle: lifecycleEnum.transient,
});

export default activeClusterEntityInjectable;
