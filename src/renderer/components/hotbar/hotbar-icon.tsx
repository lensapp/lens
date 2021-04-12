import "./hotbar-icon.scss";

import React, { DOMAttributes } from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";
import { Tooltip } from "../tooltip";
import { Avatar } from "@material-ui/core";
import { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../../common/catalog-entity";
import { hotbarStore } from "../../../common/hotbar-store";
import { ConfirmDialog } from "../confirm-dialog";
import contextMenu from "electron-context-menu";
import { navigate } from "../../navigation";
import { NativeImageCache } from "../../Icons";

interface Props extends DOMAttributes<HTMLElement> {
  entity: CatalogEntity;
  index: number;
  className?: IClassName;
  errorClass?: IClassName;
  isActive?: boolean;
}

@observer
export class HotbarIcon extends React.Component<Props> {
  get iconContent() {
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

  onAvatarClick = async () => {
    const menuContext: CatalogEntityContextMenuContext = {
      menuItems: [],
      navigate: (url: string) => navigate(url)
    };

    await this.props.entity.onContextMenuOpen(menuContext);

    contextMenu({
      menu: () => ([
        {
          label: "Remove from Hotbar",
          icon: NativeImageCache.fromName("Clear"),
          click: () => this.removeFromHotbar(this.props.entity),
        },
        ...menuItems.map(item => ({
          label: item.title,
          icon: NativeImageCache.fromName(item.icon),
          click: () => item.onClick(),
        })),
      ]),
    });
  };

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
    const avatarClassName = isActive ? "active" : "default";

    return (
      <div className={className}>
        <Tooltip targetId={entityIconId}>
          {entity.metadata.name}
        </Tooltip>
        <div onContextMenu={this.onAvatarClick}>
          <Avatar
            {...elemProps}
            id={entityIconId}
            variant="square"
            className={avatarClassName}
          >
            {this.iconContent}
          </Avatar>
        </div>
        {children}
      </div>
    );
  }
}
