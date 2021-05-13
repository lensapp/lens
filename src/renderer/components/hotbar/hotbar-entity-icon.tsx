import "./hotbar-icon.scss";

import React, { DOMAttributes } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import randomColor from "randomcolor";

import { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../../common/catalog";
import { catalogCategoryRegistry } from "../../api/catalog-category-registry";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { navigate } from "../../navigation";
import { cssNames, IClassName } from "../../utils";
import { ConfirmDialog } from "../confirm-dialog";
import { Icon } from "../icon";
import { HotbarIcon } from "./hotbar-icon";

interface Props extends DOMAttributes<HTMLElement> {
  entity: CatalogEntity;
  className?: IClassName;
  errorClass?: IClassName;
  remove: (uid: string) => void;
}

@observer
export class HotbarEntityIcon extends React.Component<Props> {
  @observable.deep private contextMenu: CatalogEntityContextMenuContext;

  componentDidMount() {
    this.contextMenu = {
      menuItems: [],
      navigate: (url: string) => navigate(url)
    };
  }

  get kindIcon() {
    const className = "badge";
    const category = catalogCategoryRegistry.getCategoryForEntity(this.props.entity);

    if (!category) {
      return <Icon material="bug_report" className={className} />;
    }

    if (category.metadata.icon.includes("<svg")) {
      return <Icon svg={category.metadata.icon} className={className} />;
    } else {
      return <Icon material={category.metadata.icon} className={className} />;
    }
  }

  get ledIcon() {
    const className = cssNames("led", { online: this.props.entity.status.phase == "connected"}); // TODO: make it more generic

    return <div className={className} />;
  }

  isActive(item: CatalogEntity) {
    return catalogEntityRegistry.activeEntity?.metadata?.uid == item.getId();
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

  generateAvatarStyle(entity: CatalogEntity): React.CSSProperties {
    return {
      "backgroundColor": randomColor({ seed: `${entity.metadata.name}-${entity.metadata.source}`, luminosity: "dark" })
    };
  }

  render() {
    const {
      entity, errorClass, remove,
      children, ...elemProps
    } = this.props;
    const className = cssNames("HotbarEntityIcon", this.props.className, {
      interactive: true,
      active: this.isActive(entity),
      disabled: !entity
    });
    const onOpen = async () => {
      await entity.onContextMenuOpen(this.contextMenu);
    };
    const menuItems = this.contextMenu?.menuItems.filter((menuItem) => !menuItem.onlyVisibleForSource || menuItem.onlyVisibleForSource === entity.metadata.source);

    return (
      <HotbarIcon
        uid={entity.getId()}
        title={entity.getName()}
        source={`${entity.metadata.source || "local"}`}
        className={className}
        active={this.isActive(entity)}
        remove={remove}
        onMenuOpen={onOpen}
        menuItems={menuItems}
        {...elemProps}
      >
        { this.ledIcon }
        { this.kindIcon }
      </HotbarIcon>
    );
  }
}
