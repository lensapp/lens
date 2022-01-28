/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./hotbar-entity-icon.module.scss";

import React, { HTMLAttributes, useState } from "react";
import { IComputedValue, observable } from "mobx";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";

import type { CatalogCategory, CatalogEntity, CatalogEntityContextMenu, CatalogEntityData, CatalogEntityKindData } from "../../../common/catalog";
import { cssNames, IClassName } from "../../utils";
import { Icon } from "../icon";
import { HotbarIcon } from "./hotbar-icon";
import { LensKubernetesClusterStatus } from "../../../common/catalog-entities/kubernetes-cluster";
import getCategoryForEntityInjectable from "../../catalog/get-category-for-entity.injectable";
import activeEntityInjectable from "../../catalog/active-entity.injectable";
import { navigate } from "../../navigation";

export interface HotbarEntityIconProps extends HTMLAttributes<HTMLElement> {
  entity: CatalogEntity;
  index: number;
  errorClass?: IClassName;
  removeById: (id: string) => void;
  size?: number;
}

interface Dependencies {
  activeEntity: IComputedValue<CatalogEntity>;
  getCategoryForEntity: (data: CatalogEntityData & CatalogEntityKindData) => CatalogCategory;
}

const NonInjectedHotbarEntityIcon = observer(({ getCategoryForEntity, activeEntity, entity, index, errorClass, removeById, size, className, children, ...elemProps  }: Dependencies & HotbarEntityIconProps) => {
  const [menuItems] = useState(observable.array<CatalogEntityContextMenu>());

  const kindIcon = () => {
    const className = styles.badge;
    const category = getCategoryForEntity(entity);

    if (!category) {
      return <Icon material="bug_report" className={className} />;
    }

    if (category.metadata.icon.includes("<svg")) {
      return <Icon svg={category.metadata.icon} className={className} />;
    } else {
      return <Icon material={category.metadata.icon} className={className} />;
    }
  };

  const ledIcon = () => {
    if (entity.kind !== "KubernetesCluster") {
      return null;
    }

    const className = cssNames(styles.led, { [styles.online]: entity.status.phase === LensKubernetesClusterStatus.CONNECTED }); // TODO: make it more generic

    return <div className={className} />;
  };

  const isActive = (item: CatalogEntity) => {
    return activeEntity.get()?.metadata?.uid == item.getId();
  };

  const onMenuOpen = () =>{
    menuItems.replace([
      {
        title: "Remove from Hotbar",
        onClick: () => removeById(entity.getId()),
      },
    ]);

    entity.onContextMenuOpen({
      menuItems,
      navigate,
    });
  };

  return (
    <HotbarIcon
      uid={entity.metadata.uid}
      title={entity.metadata.name}
      source={entity.metadata.source}
      src={entity.spec.icon?.src}
      material={entity.spec.icon?.material}
      background={entity.spec.icon?.background}
      className={className}
      active={isActive(entity)}
      onMenuOpen={() => onMenuOpen()}
      disabled={!entity}
      menuItems={menuItems}
      tooltip={`${entity.metadata.name} (${entity.metadata.source})`}
      {...elemProps}
    >
      { ledIcon() }
      { kindIcon() }
    </HotbarIcon>
  );
});

export const HotbarEntityIcon = withInjectables<Dependencies, HotbarEntityIconProps>(NonInjectedHotbarEntityIcon, {
  getProps: (di, props) => ({
    getCategoryForEntity: di.inject(getCategoryForEntityInjectable),
    activeEntity: di.inject(activeEntityInjectable),
    ...props,
  }),
});
