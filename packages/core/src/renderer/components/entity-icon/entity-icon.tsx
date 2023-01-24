/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Icon } from "../icon";
import type { CatalogEntity } from "../../../common/catalog";
import { GeneralEntity, KubernetesCluster } from "../../../common/catalog-entities";
import { getShortName } from "../../../common/catalog/helpers";

export function EntityIcon({ entity }: { entity?: CatalogEntity }) {
  if (!entity) {
    return null;
  }

  if (entity instanceof KubernetesCluster || entity instanceof GeneralEntity) {
    if (entity.spec.icon?.material) {
      return <Icon material={entity.spec.icon.material} />;
    }
  }

  if (entity instanceof KubernetesCluster) {
    if (entity.spec.icon?.src) {
      return <img src={entity.spec.icon.src} alt={entity.getName()} />;
    }
  }

  return <>{getShortName(entity)}</>;
}
