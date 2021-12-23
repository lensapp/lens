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

import styles from "./hotbar-entity-icon.module.scss";

import React, { HTMLAttributes } from "react";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";

import type { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../../common/catalog";
import { catalogCategoryRegistry } from "../../api/catalog-category-registry";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { navigate } from "../../navigation";
import { cssNames, IClassName } from "../../utils";
import { Icon } from "../icon";
import { HotbarIcon } from "./hotbar-icon";
import { LensKubernetesClusterStatus } from "../../../common/catalog-entities/kubernetes-cluster";

interface Props extends HTMLAttributes<HTMLElement> {
  entity: CatalogEntity;
  index: number;
  errorClass?: IClassName;
  add: (item: CatalogEntity, index: number) => void;
  remove: (uid: string) => void;
  size?: number;
}

@observer
export class HotbarEntityIcon extends React.Component<Props> {
  @observable private contextMenu: CatalogEntityContextMenuContext = {
    menuItems: [],
    navigate: (url: string) => navigate(url),
  };

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  get kindIcon() {
    const className = styles.badge;
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
    if (this.props.entity.kind !== "KubernetesCluster") {
      return null;
    }

    const className = cssNames(styles.led, { [styles.online]: this.props.entity.status.phase === LensKubernetesClusterStatus.CONNECTED }); // TODO: make it more generic

    return <div className={className} />;
  }

  isActive(item: CatalogEntity) {
    return catalogEntityRegistry.activeEntity?.metadata?.uid == item.getId();
  }

  async onMenuOpen() {
    const menuItems: CatalogEntityContextMenu[] = [];

    menuItems.unshift({
      title: "Remove from Hotbar",
      onClick: () => this.props.remove(this.props.entity.metadata.uid),
    });

    this.contextMenu.menuItems = menuItems;

    await this.props.entity.onContextMenuOpen(this.contextMenu);
  }

  render() {
    if (!this.contextMenu) {
      return null;
    }

    const { entity, errorClass, add, remove, index, children, ...elemProps } = this.props;

    return (
      <HotbarIcon
        uid={entity.metadata.uid}
        title={entity.metadata.name}
        source={entity.metadata.source}
        src={entity.spec.icon?.src}
        material={entity.spec.icon?.material}
        background={entity.spec.icon?.background}
        className={this.props.className}
        active={this.isActive(entity)}
        onMenuOpen={() => this.onMenuOpen()}
        disabled={!entity}
        menuItems={this.contextMenu.menuItems}
        tooltip={`${entity.metadata.name} (${entity.metadata.source})`}
        {...elemProps}
      >
        { this.ledIcon }
        { this.kindIcon }
      </HotbarIcon>
    );
  }
}
