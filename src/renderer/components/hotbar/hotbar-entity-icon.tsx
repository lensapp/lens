/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./hotbar-entity-icon.module.scss";

import type { HTMLAttributes } from "react";
import React from "react";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";

import type { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../../common/catalog";
import { catalogCategoryRegistry } from "../../api/catalog-category-registry";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { navigate } from "../../navigation";
import type { IClassName } from "../../utils";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { HotbarIcon } from "./hotbar-icon";
import { LensKubernetesClusterStatus } from "../../../common/catalog-entities/kubernetes-cluster";

export interface HotbarEntityIconProps extends HTMLAttributes<HTMLElement> {
  entity: CatalogEntity;
  index: number;
  errorClass?: IClassName;
  add: (item: CatalogEntity, index: number) => void;
  remove: (uid: string) => void;
  size?: number;
}

@observer
export class HotbarEntityIcon extends React.Component<HotbarEntityIconProps> {
  @observable private contextMenu: CatalogEntityContextMenuContext = {
    menuItems: [],
    navigate: (url: string) => navigate(url),
  };

  constructor(props: HotbarEntityIconProps) {
    super(props);
    makeObservable(this);
  }

  get kindIcon() {
    const className = styles.badge;
    const category = catalogCategoryRegistry.getCategoryForEntity(this.props.entity);

    if (!category) {
      return <Icon material="bug_report" className={className} />;
    }

    if (Icon.isSvg(category.metadata.icon)) {
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
      onClick: () => this.props.remove(this.props.entity.getId()),
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
        uid={entity.getId()}
        title={entity.getName()}
        source={entity.metadata.source}
        src={entity.spec.icon?.src}
        material={entity.spec.icon?.material}
        background={entity.spec.icon?.background}
        className={this.props.className}
        active={this.isActive(entity)}
        onMenuOpen={() => this.onMenuOpen()}
        disabled={!entity}
        menuItems={this.contextMenu.menuItems}
        tooltip={(
          entity.metadata.source
            ? `${entity.getName()} (${entity.metadata.source})`
            : entity.getName()
        )}
        {...elemProps}
      >
        { this.ledIcon }
        { this.kindIcon }
      </HotbarIcon>
    );
  }
}
