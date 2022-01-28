/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect, useState } from "react";
import { cssNames } from "../../utils";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { navigate } from "../../navigation";
import { Icon } from "../icon";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../../common/catalog";
import renderEntityContextMenuItemInjectable, { RenderEntityContextMenuItem } from "../../catalog/render-context-menu-item.injectable";
import onEntityContextMenuOpenInjectable from "../../catalog/on-entity-context-menu-open.injectable";

export interface CatalogEntityDrawerMenuProps<T extends CatalogEntity> extends MenuActionsProps {
  entity: T | null | undefined;
}

interface Dependencies {
  renderEntityContextMenuItem: RenderEntityContextMenuItem;
  onEntityContextMenuOpen: (entity: CatalogEntity, context: CatalogEntityContextMenuContext) => void;
}

const NonInjectedCatalogEntityDrawerMenu = observer(({ renderEntityContextMenuItem, onEntityContextMenuOpen, entity, className, ...menuProps }: Dependencies & CatalogEntityDrawerMenuProps<CatalogEntity>) => {
  const [contextMenuItems] = useState(observable.array<CatalogEntityContextMenu>());

  useEffect(() => {
    contextMenuItems.clear();
    onEntityContextMenuOpen(entity, {
      navigate: (url: string) => navigate(url),
      menuItems: contextMenuItems,
    });
  }, []);

  if (contextMenuItems.length === 0 || !entity?.isEnabled()) {
    return null;
  }

  return (
    <MenuActions
      className={cssNames("CatalogEntityDrawerMenu", className)}
      toolbar
      {...menuProps}
    >
      {contextMenuItems.map(renderEntityContextMenuItem("icon"))}
      <HotbarToggleMenuItem
        entity={entity}
        addContent={<Icon material="push_pin" interactive small tooltip="Add to Hotbar"/>}
        removeContent={<Icon svg="push_off" interactive small tooltip="Remove from Hotbar"/>}
      />
    </MenuActions>
  );
});

const InjectedCatalogEntityDrawerMenu = withInjectables<Dependencies, CatalogEntityDrawerMenuProps<CatalogEntity>>(NonInjectedCatalogEntityDrawerMenu, {
  getProps: (di, props) => ({
    renderEntityContextMenuItem: di.inject(renderEntityContextMenuItemInjectable),
    onEntityContextMenuOpen: di.inject(onEntityContextMenuOpenInjectable),
    ...props,
  }),
});

export function CatalogEntityDrawerMenu<T extends CatalogEntity>(props: CatalogEntityDrawerMenuProps<T>) {
  return <InjectedCatalogEntityDrawerMenu {...props} />;
}
