/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./view.module.scss";
import React, { Component } from "react";
import { observer } from "mobx-react";
import { Drawer, DrawerItem } from "../../drawer";
import type { CatalogCategory, CatalogEntity } from "../../../../common/catalog";
import { Icon } from "@k8slens/icon";
import { CatalogEntityDrawerMenu } from "../catalog-entity-drawer-menu";
import { cssNames } from "@k8slens/utilities";
import { Avatar } from "../../avatar";
import type { GetLabelBadges } from "../get-label-badges.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import getLabelBadgesInjectable from "../get-label-badges.injectable";
import isDevelopmentInjectable from "../../../../common/vars/is-development.injectable";
import type { IComputedValue } from "mobx";
import type { CatalogEntityDetailsComponent } from "./token";
import catalogEntityDetailItemsInjectable from "./detail-items.injectable";

export interface CatalogEntityDetailsProps<Entity extends CatalogEntity> {
  entity: Entity;
  hideDetails(): void;
  onRun: () => void;
}

interface Dependencies {
  getLabelBadges: GetLabelBadges;
  isDevelopment: boolean;
  detailItems: IComputedValue<CatalogEntityDetailsComponent<CatalogEntity>[]>;
}

@observer
class NonInjectedCatalogEntityDetails<Entity extends CatalogEntity> extends Component<CatalogEntityDetailsProps<Entity> & Dependencies> {
  categoryIcon(category: CatalogCategory) {
    if (Icon.isSvg(category.metadata.icon)) {
      return <Icon svg={category.metadata.icon} smallest />;
    } else {
      return <Icon material={category.metadata.icon} smallest />;
    }
  }

  renderContent(entity: Entity) {
    const { onRun, hideDetails, getLabelBadges, isDevelopment, detailItems } = this.props;
    const details = detailItems.get().map((Details, index) => <Details entity={entity} key={index} />);

    return (
      <>
        <div className="flex" data-testid={`catalog-entity-details-content-for-${entity.getId()}`}>
          <div className={styles.entityIcon}>
            <Avatar
              title={entity.getName()}
              colorHash={`${entity.getName()}-${entity.getSource()}`}
              size={128}
              src={entity.spec.icon?.src}
              data-testid="detail-panel-hot-bar-icon"
              background={entity.spec.icon?.background}
              onClick={onRun}
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
        <div className="box grow">
          {details}
        </div>
      </>
    );
  }

  render() {
    const { entity, hideDetails } = this.props;

    return (
      <Drawer
        className={styles.entityDetails}
        usePortal={true}
        open={true}
        title={`${entity.kind}: ${entity.getName()}`}
        toolbar={<CatalogEntityDrawerMenu entity={entity} key={entity.getId()} />}
        onClose={hideDetails}
        data-testid="catalog-entity-details-drawer"
      >
        {this.renderContent(entity)}
      </Drawer>
    );
  }
}

export const CatalogEntityDetails = withInjectables<Dependencies, CatalogEntityDetailsProps<CatalogEntity>>(NonInjectedCatalogEntityDetails, {
  getProps: (di, props) => ({
    ...props,
    getLabelBadges: di.inject(getLabelBadgesInjectable),
    isDevelopment: di.inject(isDevelopmentInjectable),
    detailItems: di.inject(catalogEntityDetailItemsInjectable, props.entity),
  }),
}) as <Entity extends CatalogEntity>(props: CatalogEntityDetailsProps<Entity>) => React.ReactElement;
