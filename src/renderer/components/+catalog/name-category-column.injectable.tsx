/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import styles from "./catalog.module.scss";
import type { CatalogEntity } from "../../../common/catalog";
import { prevDefault } from "../../utils";
import { Avatar } from "../avatar";
import { Icon } from "../icon";
import React from "react";
import type { RegisteredAdditionalCategoryColumn } from "./custom-category-columns";
import hotbarStoreInjectable from "../../../common/hotbar-store.injectable";
import type { HotbarStore } from "../../../common/hotbar-store";

const renderEntityName = (hotbarStore: HotbarStore) => (entity: CatalogEntity) => {
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
        svg={isItemInHotbar ? "push_off" : "push_pin"}
        tooltip={isItemInHotbar ? "Remove from Hotbar" : "Add to Hotbar"}
        onClick={onClick}
      />
    </>
  );
};


const nameCategoryColumnInjectable = getInjectable({
  id: "name-category-column",
  instantiate: (di): RegisteredAdditionalCategoryColumn => ({
    id: "name",
    priority: 0,
    renderCell: renderEntityName(di.inject(hotbarStoreInjectable)),
    titleProps: {
      title: "Name",
      className: styles.entityName,
      id: "name",
      sortBy: "name",
    },
    searchFilter: (entity) => entity.getName(),
    sortCallback: (entity) => `name=${entity.getName()}`,
  }),
});

export default nameCategoryColumnInjectable;
