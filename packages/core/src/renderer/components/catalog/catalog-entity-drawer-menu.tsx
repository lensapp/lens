/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { cssNames, hasDefiniteField } from "@k8slens/utilities";
import type { MenuActionsProps } from "../menu/menu-actions";
import { MenuActions } from "../menu/menu-actions";
import type { CatalogEntity, CatalogEntityContextMenu } from "../../api/catalog-entity";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { MenuItem } from "../menu";
import { Icon } from "@k8slens/icon";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import type { VisitEntityContextMenu } from "../../../common/catalog/visit-entity-context-menu.injectable";
import visitEntityContextMenuInjectable from "../../../common/catalog/visit-entity-context-menu.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { Navigate } from "../../navigation/navigate.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";
import type { NormalizeCatalogEntityContextMenu } from "../../catalog/normalize-menu-item.injectable";
import normalizeCatalogEntityContextMenuInjectable from "../../catalog/normalize-menu-item.injectable";

export interface CatalogEntityDrawerMenuProps<Entity extends CatalogEntity> extends MenuActionsProps {
  entity: Entity;
}

interface Dependencies {
  normalizeMenuItem: NormalizeCatalogEntityContextMenu;
  navigate: Navigate;
  visitEntityContextMenu: VisitEntityContextMenu;
}

@observer
class NonInjectedCatalogEntityDrawerMenu<T extends CatalogEntity> extends React.Component<CatalogEntityDrawerMenuProps<T> & Dependencies> {
  private readonly menuItems = observable.array<CatalogEntityContextMenu>();

  componentDidMount() {
    this.props.visitEntityContextMenu(this.props.entity, {
      menuItems: this.menuItems,
      navigate: this.props.navigate,
    });
  }

  getMenuItems(entity: T): React.ReactChild[] {
    if (!entity) {
      return [];
    }

    const items = this.menuItems
      .map(this.props.normalizeMenuItem)
      .filter(hasDefiniteField("icon"))
      .map(menuItem => (
        <MenuItem key={menuItem.title} onClick={menuItem.onClick}>
          <Icon
            interactive
            tooltip={menuItem.title}
            {...{ [Icon.isSvg(menuItem.icon) ? "svg" : "material"]: menuItem.icon }}
          />
        </MenuItem>
      ));

    items.push(
      <HotbarToggleMenuItem
        key="hotbar-toggle"
        entity={entity}
        addContent={(
          <Icon
            material="push_pin"
            interactive
            small
            tooltip="Add to Hotbar"
          />
        )}
        removeContent={(
          <Icon
            svg="push_off"
            interactive
            small
            tooltip="Remove from Hotbar"
          />
        )}
      />,
    );

    return items;
  }

  render() {
    const { className, entity, ...menuProps } = this.props;

    if (!this.menuItems.length || !entity.isEnabled()) {
      return null;
    }

    return (
      <MenuActions
        id={`menu-actions-for-catalog-entity-drawer-menu-${entity.getId()}`}
        className={cssNames("CatalogEntityDrawerMenu", className)}
        toolbar
        {...menuProps}
      >
        {this.getMenuItems(entity)}
      </MenuActions>
    );
  }
}

export const CatalogEntityDrawerMenu = withInjectables<Dependencies, CatalogEntityDrawerMenuProps<CatalogEntity>>(NonInjectedCatalogEntityDrawerMenu, {
  getProps: (di, props) => ({
    ...props,
    visitEntityContextMenu: di.inject(visitEntityContextMenuInjectable),
    normalizeMenuItem: di.inject(normalizeCatalogEntityContextMenuInjectable),
    navigate: di.inject(navigateInjectable),
  }),
}) as <Entity extends CatalogEntity>(props: CatalogEntityDrawerMenuProps<Entity>) => JSX.Element;
