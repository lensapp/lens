import "./hotbar-icon.scss";

import React, { DOMAttributes } from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";
import { Avatar, IconButton, Tooltip } from "@material-ui/core";
import { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../../common/catalog-entity";
import { Menu, MenuItem } from "../menu";
import { observable } from "mobx";
import { navigate } from "../../navigation";
import { hotbarStore } from "../../../common/hotbar-store";
import { ConfirmDialog } from "../confirm-dialog";
import { Clear } from "@material-ui/icons";

interface Props extends DOMAttributes<HTMLElement> {
  entity: CatalogEntity;
  index: number;
  className?: IClassName;
  errorClass?: IClassName;
  isActive?: boolean;
}

@observer
export class HotbarIcon extends React.Component<Props> {
  @observable.deep private contextMenu: CatalogEntityContextMenuContext;
  @observable menuOpen = false;

  componentDidMount() {
    this.contextMenu = {
      menuItems: [],
      navigate: (url: string) => navigate(url)
    };
  }

  get iconString() {
    let splittedName = this.props.entity.metadata.name.split(" ");

    if (splittedName.length === 1) {
      splittedName = splittedName[0].split("-");
    }

    if (splittedName.length === 1) {
      splittedName = splittedName[0].split("@");
    }

    splittedName = splittedName.map((part) => part.replace(/\W/g, ""));

    if (splittedName.length === 1) {
      return splittedName[0].substring(0, 2);
    } else if (splittedName.length === 2) {
      return splittedName[0].substring(0, 1) + splittedName[1].substring(0, 1);
    } else {
      return splittedName[0].substring(0, 1) + splittedName[1].substring(0, 1) + splittedName[2].substring(0, 1);
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  removeFromHotbar(item: CatalogEntity) {
    const hotbar = hotbarStore.getByName("default"); // FIXME

    if (!hotbar) {
      return;
    }

    hotbar.items = hotbar.items.filter((i) => i.entity.uid !== item.metadata.uid);
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
        message: menuItem.confirm.message
      });
    } else {
      menuItem.onClick();
    }
  }

  render() {
    const {
      entity, errorClass, isActive,
      children, ...elemProps
    } = this.props;
    const entityIconId = `hotbar-icon-${this.props.index}`;
    const className = cssNames("HotbarIcon flex inline", this.props.className, {
      interactive: true,
      active: isActive,
    });
    const onOpen = async () => {
      await entity.onContextMenuOpen(this.contextMenu);
      this.toggleMenu();
    };
    const menuItems = this.contextMenu?.menuItems.filter((menuItem) => !menuItem.onlyVisibleForSource || menuItem.onlyVisibleForSource === entity.metadata.source);

    return (
      <div className={className}>
        <Tooltip title={entity.metadata.name}>
          <Avatar {...elemProps} id={entityIconId} variant="square" className={isActive ? "active" : "default"}>{this.iconString}</Avatar>
        </Tooltip>
        <Menu
          usePortal={false}
          htmlFor={entityIconId}
          className="HotbarIconMenu"
          isOpen={this.menuOpen}
          toggleEvent="contextmenu"
          position={{right: true, bottom: true }} // FIXME: position does not work
          open={() => onOpen()}
          close={() => this.toggleMenu()}>
          <MenuItem key="remove-from-hotbar" onClick={() => this.removeFromHotbar(entity) }>
            <Tooltip title="Remove from hotbar">
              <IconButton>
                <Clear /> Remove from Hotbar
              </IconButton>
            </Tooltip>
          </MenuItem>
          { this.contextMenu && menuItems.map((menuItem) => {
            return (
              <MenuItem key={menuItem.title} onClick={() => this.onMenuItemClick(menuItem) }>
                {menuItem.icon} {menuItem.title}
              </MenuItem>
            );
          })}
        </Menu>
        {children}
      </div>
    );
  }
}
