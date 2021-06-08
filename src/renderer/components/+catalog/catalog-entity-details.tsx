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
import { Drawer, DrawerItem, DrawerItemLabels } from "../drawer";
import { CatalogEntity, catalogEntityRunContext } from "../../api/catalog-entity";
import type { CatalogCategory } from "../../../common/catalog";
import { Icon } from "../icon";
import { KubeObject } from "../../api/kube-object";
import { CatalogEntityDrawerMenu } from "./catalog-entity-drawer-menu";
import { catalogEntityDetailRegistry } from "../../../extensions/registries";
import { HotbarIcon } from "../hotbar/hotbar-icon";

interface Props {
  entity: CatalogEntity;
  hideDetails(): void;
}

@observer
export class CatalogEntityDetails extends Component<Props> {
  private abortController?: AbortController;

  constructor(props: Props) {
    super(props);
  }

  componentWillUnmount() {
    this.abortController?.abort();
  }

  categoryIcon(category: CatalogCategory) {
    if (category.metadata.icon.includes("<svg")) {
      return <Icon svg={category.metadata.icon} smallest />;
    } else {
      return <Icon material={category.metadata.icon} smallest />;
    }
  }

  openEntity() {
    this.props.entity.onRun(catalogEntityRunContext);
  }

  renderContent() {
    const { entity } = this.props;
    const labels = KubeObject.stringifyLabels(entity.metadata.labels);
    const detailItems = catalogEntityDetailRegistry.getItemsForKind(entity.kind, entity.apiVersion);
    const details = detailItems.map((item, index) => {
      return <item.components.Details entity={entity} key={index}/>;
    });

    const showDetails = detailItems.find((item) => item.priority > 999) === undefined;

    return (
      <>
        {showDetails && (
          <div className="flex CatalogEntityDetails">
            <div className="EntityIcon box top left">
              <HotbarIcon
                uid={entity.metadata.uid}
                title={entity.metadata.name}
                source={entity.metadata.source}
                onClick={() => this.openEntity()}
                size={128} />
              <div className="IconHint">
                Click to open
              </div>
            </div>
            <div className="box grow EntityMetadata">
              <DrawerItem name="Name">
                {entity.metadata.name}
              </DrawerItem>
              <DrawerItem name="Kind">
                {entity.kind}
              </DrawerItem>
              <DrawerItem name="Source">
                {entity.metadata.source}
              </DrawerItem>
              <DrawerItemLabels
                name="Labels"
                labels={labels}
              />
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
    const title = `${entity.kind}: ${entity.metadata.name}`;

    return (
      <Drawer
        className="CatalogEntityDetails"
        usePortal={true}
        open={true}
        title={title}
        toolbar={<CatalogEntityDrawerMenu entity={entity} key={entity.getId()} />}
        onClose={hideDetails}
      >
        {this.renderContent()}
      </Drawer>
    );
  }
}
