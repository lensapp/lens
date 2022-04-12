/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { cssNames } from "../../utils";
import type { MenuActionsProps } from "../menu/menu-actions";
import { MenuActions } from "../menu/menu-actions";
import type { CatalogEntity, CatalogEntityContextMenu } from "../../api/catalog-entity";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { navigate } from "../../navigation";
import { MenuItem } from "../menu";
import { ConfirmDialog } from "../confirm-dialog";
import { Icon } from "../icon";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import type { OnContextMenuOpen } from "../../../common/catalog/on-context-menu-open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import onContextMenuOpenInjectable from "../../../common/catalog/on-context-menu-open.injectable";

export interface CatalogEntityDrawerMenuProps<Entity extends CatalogEntity> extends MenuActionsProps {
  entity: Entity;
}

interface Dependencies {
  onContextMenuOpen: OnContextMenuOpen;
}

@observer
class NonInjectedCatalogEntityDrawerMenu<Entity extends CatalogEntity> extends React.Component<Dependencies & CatalogEntityDrawerMenuProps<Entity>> {
  private readonly menuItems = observable.array<CatalogEntityContextMenu>();

  componentDidMount() {
    this.props.onContextMenuOpen(this.props.entity, {
      menuItems: this.menuItems,
      navigate: (url) => navigate(url),
    });
  }

  onMenuItemClick(menuItem: CatalogEntityContextMenu) {
    if (menuItem.confirm) {
      ConfirmDialog.open({
        okButtonProps: {
          primary: false,
          accent: true,
        },
        ok: () => {
          menuItem.onClick();
        },
        message: menuItem.confirm.message,
      });
    } else {
      menuItem.onClick();
    }
  }

  getMenuItems(entity: Entity): React.ReactChild[] {
    if (!entity) {
      return [];
    }

    const items: React.ReactChild[] = [];

    for (const menuItem of this.menuItems) {
      if (!menuItem.icon) {
        continue;
      }

      const key = Icon.isSvg(menuItem.icon) ? "svg" : "material";

      items.push(
        <MenuItem key={menuItem.title} onClick={() => this.onMenuItemClick(menuItem)}>
          <Icon
            interactive
            tooltip={menuItem.title}
            {...{ [key]: menuItem.icon }}
          />
        </MenuItem>,
      );
    }

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
    onContextMenuOpen: di.inject(onContextMenuOpenInjectable),
  }),
}) as <Entity extends CatalogEntity>(props: CatalogEntityDrawerMenuProps<Entity>) => JSX.Element;
