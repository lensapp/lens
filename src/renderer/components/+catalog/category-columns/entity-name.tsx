/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "../catalog.module.scss";

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { CatalogEntity } from "../../../../common/catalog";
import activeHotbarInjectable from "../../../../common/hotbar-store/active-hotbar.injectable";
import type { Hotbar } from "../../../../common/hotbar-store/hotbar";
import { Avatar } from "../../avatar";
import { Icon } from "../../icon";
import { prevDefault } from "../../../utils";

export interface EntityNameProps {
  entity: CatalogEntity;
}

interface Dependencies {
  activeHotbar: IComputedValue<Hotbar>;
}

const NonInjectedEntityName = observer(({ activeHotbar, entity }: Dependencies & EntityNameProps) => {
  const hotbar = activeHotbar.get();
  const isItemInHotbar = hotbar.hasItem(entity);
  const onClick = prevDefault(
    isItemInHotbar
      ? () => hotbar.removeItemById(entity.getId())
      : () => hotbar.addItem(entity),
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

export const EntityName = withInjectables<Dependencies, EntityNameProps>(NonInjectedEntityName, {
  getProps: (di, props) => ({
    activeHotbar: di.inject(activeHotbarInjectable),
    ...props,
  }),
});
