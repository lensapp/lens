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

import "./catalog-entity-details.scss";
import React, { Component } from "react";
import { observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import { catalogEntityRunContext } from "../../api/catalog-entity";
import type { CatalogCategory, CatalogEntity } from "../../../common/catalog";
import { Icon } from "../icon";
import { CatalogEntityDrawerMenu } from "./catalog-entity-drawer-menu";
import { CatalogEntityDetailRegistry } from "../../../extensions/registries";
import { HotbarIcon } from "../hotbar/hotbar-icon";
import type { CatalogEntityItem } from "./catalog-entity.store";
import { isDevelopment } from "../../../common/vars";

interface Props<T extends CatalogEntity> {
  item: CatalogEntityItem<T> | null | undefined;
  hideDetails(): void;
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

  renderContent(item: CatalogEntityItem<T>) {
    const detailItems = CatalogEntityDetailRegistry.getInstance().getItemsForKind(item.kind, item.apiVersion);
    const details = detailItems.map(({ components }, index) => {
      return <components.Details entity={item.entity} key={index}/>;
    });

    const showDetails = detailItems.find((item) => item.priority > 999) === undefined;

    return (
      <>
        {showDetails && (
          <div className="flex CatalogEntityDetails">
            <div className="EntityIcon box top left">
              <HotbarIcon
                uid={item.id}
                title={item.name}
                source={item.source}
                src={item.entity.spec.icon?.src}
                material={item.entity.spec.icon?.material}
                background={item.entity.spec.icon?.background}
                disabled={!item?.enabled}
                onClick={() => item.onRun(catalogEntityRunContext)}
                size={128} />
              {item?.enabled && (
                <div className="IconHint">
                  Click to open
                </div>
              )}
            </div>
            <div className="box grow EntityMetadata">
              <DrawerItem name="Name">
                {item.name}
              </DrawerItem>
              <DrawerItem name="Kind">
                {item.kind}
              </DrawerItem>
              <DrawerItem name="Source">
                {item.source}
              </DrawerItem>
              <DrawerItem name="Status">
                {item.phase}
              </DrawerItem>
              <DrawerItem name="Labels">
                {...item.getLabelBadges(this.props.hideDetails)}
              </DrawerItem>
              {isDevelopment && (
                <DrawerItem name="Id">
                  {item.getId()}
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
    const { item, hideDetails } = this.props;
    const title = `${item.kind}: ${item.name}`;

    return (
      <Drawer
        className="CatalogEntityDetails"
        usePortal={true}
        open={true}
        title={title}
        toolbar={<CatalogEntityDrawerMenu item={item} key={item.getId()} />}
        onClose={hideDetails}
      >
        {item && this.renderContent(item)}
      </Drawer>
    );
  }
}
