/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React, { ReactNode } from "react";
import type { CatalogEntity } from "../../../common/catalog";
import activeHotbarInjectable from "../../../common/hotbar-store/active-hotbar.injectable";
import type { Hotbar } from "../../../common/hotbar-store/hotbar";
import { MenuItem } from "../menu";

export interface HotbarToggleMenuItemProps {
  entity: CatalogEntity;
  addContent: ReactNode;
  removeContent: ReactNode;
}

interface Dependencies {
  activeHotbar: IComputedValue<Hotbar>;
}

const NonInjectedHotbarToggleMenuItem = observer(({ activeHotbar, entity, addContent, removeContent }: Dependencies & HotbarToggleMenuItemProps) => {
  const hotbar = activeHotbar.get();
  const itemInHotbar = hotbar.hasItem(entity);
  const onClick = itemInHotbar
    ? () => hotbar.removeItemById(entity.getId())
    : () => hotbar.addItem(entity);

  return (
    <MenuItem onClick={onClick}>
      {itemInHotbar ? removeContent : addContent }
    </MenuItem>
  );
});

export const HotbarToggleMenuItem = withInjectables<Dependencies, HotbarToggleMenuItemProps>(NonInjectedHotbarToggleMenuItem, {
  getProps: (di, props) => ({
    activeHotbar: di.inject(activeHotbarInjectable),
    ...props,
  }),
});
