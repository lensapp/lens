import "./hotbar-icon.scss";

import React, { DOMAttributes } from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName, iter } from "../../utils";
import { Tooltip } from "../tooltip";
import { Avatar } from "@material-ui/core";
import { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../../common/catalog";
import { Menu, MenuItem } from "../menu";
import { Icon } from "../icon";
import { computed, observable } from "mobx";
import { navigate } from "../../navigation";
import { HotbarStore } from "../../../common/hotbar-store";
import { ConfirmDialog } from "../confirm-dialog";
import randomColor from "randomcolor";
import { catalogCategoryRegistry } from "../../api/catalog-category-registry";
import GraphemeSplitter from "grapheme-splitter";

interface Props extends DOMAttributes<HTMLElement> {
  entity: CatalogEntity;
  index: number;
  className?: IClassName;
  errorClass?: IClassName;
  isActive?: boolean;
}

function getNameParts(name: string): string[] {
  const byWhitespace = name.split(/\s+/);

  if (byWhitespace.length > 1) {
    return byWhitespace;
  }

  const byDashes = name.split(/[-_]+/);

  if (byDashes.length > 1) {
    return byDashes;
  }

  return name.split(/@+/);
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

  @computed get iconString() {
    const [rawFirst, rawSecond, rawThird] = getNameParts(this.props.entity.metadata.name);
    const splitter = new GraphemeSplitter();
    const first = splitter.iterateGraphemes(rawFirst);
    const second = rawSecond ? splitter.iterateGraphemes(rawSecond): first;
    const third = rawThird ? splitter.iterateGraphemes(rawThird) : iter.newEmpty();

    return [
      ...iter.take(first, 1),
      ...iter.take(second, 1),
      ...iter.take(third, 1),
    ].filter(Boolean).join("");
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

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  remove(item: CatalogEntity) {
    const hotbar = HotbarStore.getInstance();

    hotbar.removeFromHotbar(item);
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
        <Tooltip targetId={entityIconId}>{entity.metadata.name} ({entity.metadata.source || "local"})</Tooltip>
        <Avatar
          {...elemProps}
          id={entityIconId}
          variant="square"
          className={isActive ? "active" : "default"}
          style={this.generateAvatarStyle(entity)}
        >
          {this.iconString}
        </Avatar>
        { this.ledIcon }
        { this.kindIcon }
        <Menu
          usePortal
          htmlFor={entityIconId}
          className="HotbarIconMenu"
          isOpen={this.menuOpen}
          toggleEvent="contextmenu"
          position={{right: true, bottom: true }} // FIXME: position does not work
          open={() => onOpen()}
          close={() => this.toggleMenu()}>
          <MenuItem key="remove-from-hotbar" onClick={() => this.remove(entity) }>
            <Icon material="clear" small interactive={true} title="Remove from hotbar"/> Remove from Hotbar
          </MenuItem>
          { this.contextMenu && menuItems.map((menuItem) => {
            return (
              <MenuItem key={menuItem.title} onClick={() => this.onMenuItemClick(menuItem) }>
                <Icon material={menuItem.icon} small interactive={true} title={menuItem.title}/> {menuItem.title}
              </MenuItem>
            );
          })}
        </Menu>
        {children}
      </div>
    );
  }
}
