/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ReactNode } from "react";
import React, { useState } from "react";

import { MenuItem } from "../menu";

import type { CatalogEntity } from "../../api/catalog-entity";
import { withInjectables } from "@ogre-tools/injectable-react";
import hotbarStoreInjectable from "../../../common/hotbars/store.injectable";
import type { HotbarStore } from "../../../common/hotbars/store";

interface Dependencies {
  hotbarStore: HotbarStore;
}

interface HotbarToggleMenuItemProps {
  entity: CatalogEntity;
  addContent: ReactNode;
  removeContent: ReactNode;
}

function NonInjectedHotbarToggleMenuItem({
  addContent,
  entity,
  hotbarStore,
  removeContent,
}: Dependencies & HotbarToggleMenuItemProps) {
  const [itemInHotbar, setItemInHotbar] = useState(hotbarStore.isAddedToActive(entity));

  return (
    <MenuItem
      onClick={() => {
        if (itemInHotbar) {
          hotbarStore.removeFromHotbar(entity.getId());
          setItemInHotbar(false);
        } else {
          hotbarStore.addToHotbar(entity);
          setItemInHotbar(true);
        }
      }}
    >
      {itemInHotbar ? removeContent : addContent }
    </MenuItem>
  );
}

export const HotbarToggleMenuItem = withInjectables<Dependencies, HotbarToggleMenuItemProps>(
  NonInjectedHotbarToggleMenuItem,

  {
    getProps: (di, props) => ({
      hotbarStore: di.inject(hotbarStoreInjectable),
      ...props,
    }),
  },
);

