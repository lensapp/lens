/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./hotbar-entity-icon.module.scss";

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";

import type { CatalogCategoryRegistry, CatalogEntity, CatalogEntityContextMenu } from "../../../common/catalog";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import type { IClassName } from "../../utils";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { HotbarIcon } from "./hotbar-icon";
import { LensKubernetesClusterStatus } from "../../../common/catalog-entities/kubernetes-cluster";
import type { OnContextMenuOpen } from "../../../common/catalog/on-context-menu-open.injectable";
import { navigate } from "../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import onContextMenuOpenInjectable from "../../../common/catalog/on-context-menu-open.injectable";

export interface HotbarEntityIconProps {
  entity: CatalogEntity;
  index: number;
  errorClass?: IClassName;
  add: (item: CatalogEntity, index: number) => void;
  remove: (uid: string) => void;
  size?: number;
  onClick?: () => void;
  className?: string;
}

interface Dependencies {
  onContextMenuOpen: OnContextMenuOpen;
  catalogCategoryRegistry: CatalogCategoryRegistry;
}

@observer
class NonInjectedHotbarEntityIcon extends React.Component<HotbarEntityIconProps & Dependencies> {
  private readonly menuItems = observable.array<CatalogEntityContextMenu>();

  get kindIcon() {
    const className = styles.badge;
    const category = this.props.catalogCategoryRegistry.getCategoryForEntity(this.props.entity);

    if (!category) {
      return <Icon material="bug_report" className={className} />;
    }

    if (Icon.isSvg(category.metadata.icon)) {
      return <Icon svg={category.metadata.icon} className={className} />;
    }

    return <Icon material={category.metadata.icon} className={className} />;
  }

  get ledIcon() {
    if (this.props.entity.kind !== "KubernetesCluster") {
      return null;
    }

    return (
      <div
        className={cssNames(styles.led, {
          // TODO: make it more generic
          [styles.online]: this.props.entity.status.phase === LensKubernetesClusterStatus.CONNECTED,
        })}
      />
    );
  }

  isActive(item: CatalogEntity) {
    return catalogEntityRegistry.activeEntity?.metadata?.uid == item.getId();
  }

  onMenuOpen() {
    this.menuItems.replace([{
      title: "Remove from Hotbar",
      onClick: () => this.props.remove(this.props.entity.getId()),
    }]);

    this.props.onContextMenuOpen(this.props.entity, {
      menuItems: this.menuItems,
      navigate,
    });
  }

  render() {
    const { entity, className, onClick } = this.props;

    return (
      <HotbarIcon
        uid={entity.getId()}
        title={entity.getName()}
        source={entity.metadata.source}
        src={entity.spec.icon?.src}
        material={entity.spec.icon?.material}
        background={entity.spec.icon?.background}
        className={className}
        active={this.isActive(entity)}
        onMenuOpen={() => this.onMenuOpen()}
        disabled={!entity}
        menuItems={this.menuItems}
        tooltip={(
          entity.metadata.source
            ? `${entity.getName()} (${entity.metadata.source})`
            : entity.getName()
        )}
        onClick={onClick}
      >
        { this.ledIcon }
        { this.kindIcon }
      </HotbarIcon>
    );
  }
}

export const HotbarEntityIcon = withInjectables<Dependencies, HotbarEntityIconProps>(NonInjectedHotbarEntityIcon, {
  getProps: (di, props) => ({
    ...props,
    catalogCategoryRegistry: di.inject(catalogCategoryRegistryInjectable),
    onContextMenuOpen: di.inject(onContextMenuOpenInjectable),
  }),
});
