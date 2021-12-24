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

import styles from "./catalog-entity-details.module.scss";
import React, { Component } from "react";
import { observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import type { CatalogCategory, CatalogEntity } from "../../../common/catalog";
import { Icon } from "../icon";
import { CatalogEntityDrawerMenu } from "./catalog-entity-drawer-menu";
import { CatalogEntityDetailRegistry } from "../../../extensions/registries";
import { isDevelopment } from "../../../common/vars";
import { cssNames } from "../../utils";
import { Avatar } from "../avatar";
import { getLabelBadges } from "./helpers";

interface Props<T extends CatalogEntity> {
  entity: T;
  hideDetails(): void;
  onRun: () => void;
}

@observer
export class CatalogEntityDetails<T extends CatalogEntity> extends Component<Props<T>> {
  categoryIcon(category: CatalogCategory) {
    if (category.metadata.icon.includes("<svg")) {
      return <Icon svg={category.metadata.icon} smallest />;
    } else {
      return <Icon material={category.metadata.icon} smallest />;
    }
  }

  renderContent(entity: T) {
    const { onRun, hideDetails } = this.props;
    const detailItems = CatalogEntityDetailRegistry.getInstance().getItemsForKind(entity.kind, entity.apiVersion);
    const details = detailItems.map(({ components }, index) => <components.Details entity={entity} key={index} />);
    const showDefaultDetails = detailItems.find((item) => item.priority > 999) === undefined;

    return (
      <>
        {showDefaultDetails && (
          <div className="flex">
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
        )}
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
      >
        {this.renderContent(entity)}
      </Drawer>
    );
  }
}
