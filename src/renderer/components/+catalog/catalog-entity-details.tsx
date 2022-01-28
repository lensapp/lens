/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog-entity-details.module.scss";
import React from "react";
import { observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import type { CatalogEntity } from "../../../common/catalog";
import { Icon } from "../icon";
import { CatalogEntityDrawerMenu } from "./catalog-entity-drawer-menu";
import { isDevelopment } from "../../../common/vars";
import { cssNames } from "../../utils";
import { Avatar } from "../avatar";
import { getLabelBadges } from "./helpers";
import { withInjectables } from "@ogre-tools/injectable-react";
import onRunInjectable from "../../catalog/on-run.injectable";
import type { CatalogEntityDetailComponents } from "../../catalog/catalog-entity-details";
import getDetailItemsForEntityInjectable from "./get-detail-items-for-entity.injectable";
import showDefaultDetailsInjectable from "./show-default-details.injectable";

export interface CatalogEntityDetailsProps<T extends CatalogEntity> {
  entity: T;
  hideDetails: () => void;
}

interface Dependencies {
  onRun: (entity: CatalogEntity) => void;
  getDetailItemsForEntity: (entity: CatalogEntity) => CatalogEntityDetailComponents<CatalogEntity>[];
  showDefaultDetails: (entity: CatalogEntity) => boolean;
}

const NonInjectedCatalogEntityDetails = observer(({ entity, hideDetails, onRun, getDetailItemsForEntity, showDefaultDetails }: Dependencies & CatalogEntityDetailsProps<CatalogEntity>) => {
  const detailItems = getDetailItemsForEntity(entity);
  const details = detailItems.map(({ Details }, index) => <Details entity={entity} key={index} />);

  return (
    <Drawer
      className={styles.entityDetails}
      usePortal={true}
      open={true}
      title={`${entity.kind}: ${entity.getName()}`}
      toolbar={<CatalogEntityDrawerMenu entity={entity} key={entity.getId()} />}
      onClose={hideDetails}
    >
      {showDefaultDetails(entity) && (
        <div className="flex">
          <div className={styles.entityIcon}>
            <Avatar
              title={entity.getName()}
              colorHash={`${entity.getName()}-${entity.getSource()}`}
              size={128}
              src={entity.spec.icon?.src}
              data-testid="detail-panel-hot-bar-icon"
              background={entity.spec.icon?.background}
              onClick={() => onRun(entity)}
              className={styles.avatar}
            >
              {entity.spec.icon?.material && <Icon material={entity.spec.icon?.material}/>}
            </Avatar>
            {entity.isEnabled() && (
              <div className={styles.hint}>
                  Click to open
              </div>
            )}
          </div>
          <div className={cssNames("box grow", styles.metadata)}>
            <DrawerItem name="Name">
              {entity.getName()}
            </DrawerItem>
            <DrawerItem name="Kind">
              {entity.kind}
            </DrawerItem>
            <DrawerItem name="Source">
              {entity.getSource()}
            </DrawerItem>
            <DrawerItem name="Status">
              {entity.status.phase}
            </DrawerItem>
            <DrawerItem name="Labels">
              {getLabelBadges(entity, hideDetails)}
            </DrawerItem>
            {isDevelopment && (
              <DrawerItem name="Id">
                {entity.getId()}
              </DrawerItem>
            )}
          </div>
        </div>
      )}
      <div className="box grow">
        {details}
      </div>
    </Drawer>
  );
});

const InjectedCatalogEntityDetails = withInjectables<Dependencies, CatalogEntityDetailsProps<CatalogEntity>>(NonInjectedCatalogEntityDetails, {
  getProps: (di, props) => ({
    onRun: di.inject(onRunInjectable),
    getDetailItemsForEntity: di.inject(getDetailItemsForEntityInjectable),
    showDefaultDetails: di.inject(showDefaultDetailsInjectable),
    ...props,
  }),
});

export function CatalogEntityDetails<T extends CatalogEntity>(props: CatalogEntityDetailsProps<T>) {
  return <InjectedCatalogEntityDetails {...props} />;
}
