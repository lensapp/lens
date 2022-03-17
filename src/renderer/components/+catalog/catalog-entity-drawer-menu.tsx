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

export interface CatalogEntityDrawerMenuProps<T extends CatalogEntity> extends MenuActionsProps {
  entity: T;
}

@observer
export class CatalogEntityDrawerMenu<T extends CatalogEntity> extends React.Component<CatalogEntityDrawerMenuProps<T>> {
  private readonly menuItems = observable.array<CatalogEntityContextMenu>();

  componentDidMount() {
    this.props.entity?.onContextMenuOpen({
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

  getMenuItems(entity: T): React.ReactChild[] {
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
