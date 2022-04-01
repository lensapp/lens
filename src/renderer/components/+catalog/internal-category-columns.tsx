/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog.module.scss";

import React from "react";
import type { RegisteredAdditionalCategoryColumn } from "./custom-category-columns";
import { getLabelBadges } from "./helpers";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { observer } from "mobx-react";
import type { HotbarStore } from "../../../common/hotbar-store";
import { prevDefault } from "../../utils";
import { Avatar } from "../avatar";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { CatalogEntity } from "../../api/catalog-entity";
import hotbarStoreInjectable from "../../../common/hotbar-store.injectable";

export const browseAllColumns: RegisteredAdditionalCategoryColumn[] = [
  {
    id: "kind",
    priority: 5,
    renderCell: entity => entity.kind,
    titleProps: {
      id: "kind",
      sortBy: "kind",
      title: "Kind",
    },
    sortCallback: entity => entity.kind,
  },
];

export const nameCategoryColumn: RegisteredAdditionalCategoryColumn = {
  id: "name",
  priority: 0,
  renderCell: (entity) => <EntityName entity={entity}/>,
  titleProps: {
    title: "Name",
    className: styles.entityName,
    id: "name",
    sortBy: "name",
  },
  searchFilter: entity => entity.getName(),
  sortCallback: entity => `name=${entity.getName()}`,
};

export const defaultCategoryColumns: RegisteredAdditionalCategoryColumn[] = [
  {
    id: "source",
    priority: 10,
    renderCell: entity => entity.getSource(),
    titleProps: {
      title: "Source",
      className: styles.sourceCell,
      id: "source",
      sortBy: "source",
    },
    sortCallback: entity => entity.getSource(),
    searchFilter: entity => `source=${entity.getSource()}`,
  },
  {
    id: "labels",
    priority: 20,
    renderCell: getLabelBadges,
    titleProps: {
      id: "labels",
      title: "Labels",
      className: `${styles.labelsCell} scrollable`,
    },
    searchFilter: entity => KubeObject.stringifyLabels(entity.metadata.labels),
  },
  {
    id: "status",
    priority: 30,
    renderCell: entity => (
      <span key="phase" className={entity.status.phase}>
        {entity.status.phase}
      </span>
    ),
    titleProps: {
      title: "Status",
      className: styles.statusCell,
      id: "status",
      sortBy: "status",
    },
    searchFilter: entity => entity.status.phase,
    sortCallback: entity => entity.status.phase,
  },
];

interface Dependencies {
  hotbarStore: HotbarStore;
}

interface EntityNameProps {
  entity: CatalogEntity;
}

const NonInjectedEntityName = observer(({ entity, hotbarStore }: Dependencies & EntityNameProps) => {
  const isItemInHotbar = hotbarStore.isAddedToActive(entity);
  const onClick = prevDefault(
    isItemInHotbar
      ? () => hotbarStore.removeFromHotbar(entity.getId())
      : () => hotbarStore.addToHotbar(entity),
  );

  return (
    <>
      <Avatar
        title={entity.getName()}
        colorHash={`${entity.getName()}-${entity.getSource()}`}
        src={entity.spec.icon?.src}
        background={entity.spec.icon?.background}
        className={styles.catalogAvatar}
        size={24}
      >
        {entity.spec.icon?.material && <Icon material={entity.spec.icon?.material} small/>}
      </Avatar>
      <span>{entity.getName()}</span>
      <Icon
        small
        className={styles.pinIcon}
        material={!isItemInHotbar && "push_pin"}
        svg={isItemInHotbar ? "push_off" : "push_pin"}
        tooltip={isItemInHotbar ? "Remove from Hotbar" : "Add to Hotbar"}
        onClick={onClick}
      />
    </>
  );
});

const EntityName = withInjectables<Dependencies, EntityNameProps>(
  NonInjectedEntityName,

  {
    getProps: (di, props) => ({
      hotbarStore: di.inject(hotbarStoreInjectable),
      ...props,
    }),
  },
);
