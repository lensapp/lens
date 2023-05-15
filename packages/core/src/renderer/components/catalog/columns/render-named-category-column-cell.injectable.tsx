/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import styles from "../catalog.module.scss";
import React from "react";
import activeHotbarInjectable from "../../../../features/hotbar/storage/common/active.injectable";
import { Avatar } from "../../avatar";
import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";
import { Icon } from "@k8slens/icon";
import { prevDefault } from "@k8slens/utilities";

const renderNamedCategoryColumnCellInjectable = getInjectable({
  id: "render-named-category-column-cell",
  instantiate: (di): RegisteredAdditionalCategoryColumn["renderCell"] => {
    const activeHotbar = di.inject(activeHotbarInjectable);

    return (entity) => {
      const hotbar = activeHotbar.get();

      if (!hotbar) {
        return null;
      }

      const isItemInHotbar = hotbar.hasEntity(entity.getId());
      const onClick = prevDefault((
        isItemInHotbar
          ? () => hotbar.removeEntity(entity.getId())
          : () => hotbar.addEntity(entity)
      ));

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
  },
});

export default renderNamedCategoryColumnCellInjectable;
