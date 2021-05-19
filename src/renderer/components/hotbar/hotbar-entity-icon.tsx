/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { DOMAttributes } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";

import type { CatalogEntity, CatalogEntityContextMenuContext } from "../../../common/catalog";
import { catalogCategoryRegistry } from "../../api/catalog-category-registry";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { navigate } from "../../navigation";
import { cssNames, IClassName } from "../../utils";
import { Icon } from "../icon";
import { HotbarIcon } from "./hotbar-icon";
import { HotbarStore } from "../../../common/hotbar-store";

interface Props extends DOMAttributes<HTMLElement> {
  entity: CatalogEntity;
  index: number;
  className?: IClassName;
  errorClass?: IClassName;
  add: (item: CatalogEntity, index: number) => void;
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

  isPersisted(entity: CatalogEntity) {
    return HotbarStore.getInstance().getActive().items.find((item) => item?.entity?.uid === entity.metadata.uid) !== undefined;
  }

  render() {
    if (!this.contextMenu) {
      return null;
    }

    const {
      entity, errorClass, add, remove,
      index, children, ...elemProps
    } = this.props;
    const className = cssNames("HotbarEntityIcon", this.props.className, {
      interactive: true,
      active: this.isActive(entity),
      disabled: !entity
    });
    const onOpen = async () => {
      await entity.onContextMenuOpen(this.contextMenu);
    };
    const isActive = this.isActive(entity);
    const isPersisted = this.isPersisted(entity);
    const menuItems = this.contextMenu?.menuItems.filter((menuItem) => !menuItem.onlyVisibleForSource || menuItem.onlyVisibleForSource === entity.metadata.source);

    if (!isPersisted) {
      menuItems.unshift({
        title: "Pin to Hotbar",
        onClick: () => add(entity, index)
      });
    } else {
      menuItems.unshift({
        title: "Unpin from Hotbar",
        onClick: () => remove(entity.metadata.uid)
      });
    }

    return (
      <HotbarIcon
        uid={entity.metadata.uid}
        title={entity.metadata.name}
        source={entity.metadata.source}
        className={className}
        active={isActive}
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
