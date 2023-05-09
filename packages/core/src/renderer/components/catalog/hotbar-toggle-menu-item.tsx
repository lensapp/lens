/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useState } from "react";

import { MenuItem } from "../menu";

import type { CatalogEntity } from "../../api/catalog-entity";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import type { Hotbar } from "../../../features/hotbar/storage/common/hotbar";
import activeHotbarInjectable from "../../../features/hotbar/storage/common/active.injectable";
import type { SafeReactNode } from "@k8slens/utilities";

interface Dependencies {
  activeHotbar: IComputedValue<Hotbar | undefined>;
}

interface HotbarToggleMenuItemProps {
  entity: CatalogEntity;
  addContent: SafeReactNode;
  removeContent: SafeReactNode;
}

function NonInjectedHotbarToggleMenuItem({
  addContent,
  entity,
  activeHotbar,
  removeContent,
}: Dependencies & HotbarToggleMenuItemProps) {
  const [itemInHotbar, setItemInHotbar] = useState(activeHotbar.get()?.hasEntity(entity.getId()) ?? false);

  return (
    <MenuItem
      onClick={() => {
        if (itemInHotbar) {
          activeHotbar.get()?.removeEntity(entity.getId());
          setItemInHotbar(false);
        } else {
          activeHotbar.get()?.addEntity(entity);
          setItemInHotbar(true);
        }
      }}
    >
      {itemInHotbar ? removeContent : addContent }
    </MenuItem>
  );
}

export const HotbarToggleMenuItem = withInjectables<Dependencies, HotbarToggleMenuItemProps>(NonInjectedHotbarToggleMenuItem, {
  getProps: (di, props) => ({
    ...props,
    activeHotbar: di.inject(activeHotbarInjectable),
  }),
});

