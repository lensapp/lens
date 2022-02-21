/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { ReactNode, useState } from "react";

import { HotbarStore } from "../../../common/hotbar-store";
import { MenuItem } from "../menu";

import type { CatalogEntity } from "../../api/catalog-entity";

export function HotbarToggleMenuItem(props: { entity: CatalogEntity; addContent: ReactNode; removeContent: ReactNode }) {
  const store = HotbarStore.getInstance();
  const [itemInHotbar, setItemInHotbar] = useState(store.isAddedToActive(props.entity));

  return (
    <MenuItem onClick={() => {
      if (itemInHotbar) {
        store.removeFromHotbar(props.entity.getId());
        setItemInHotbar(false);
      } else {
        store.addToHotbar(props.entity);
        setItemInHotbar(true);
      }
    }}>
      {itemInHotbar ? props.removeContent : props.addContent }
    </MenuItem>
  );
}
