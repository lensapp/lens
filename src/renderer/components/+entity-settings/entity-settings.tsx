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

import "./entity-settings.scss";

import React from "react";
import { observable } from "mobx";
import { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { PageLayout } from "../layout/page-layout";
import { navigation } from "../../navigation";
import { Tabs, Tab } from "../tabs";
import { CatalogEntity } from "../../api/catalog-entity";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { entitySettingRegistry } from "../../../extensions/registries";
import { EntitySettingsRouteParams } from "./entity-settings.route";

interface Props extends RouteComponentProps<EntitySettingsRouteParams> {
}

@observer
export class EntitySettings extends React.Component<Props> {
  @observable activeTab: string;

  get entityId() {
    return this.props.match.params.entityId;
  }

  get entity(): CatalogEntity {
    return catalogEntityRegistry.getById(this.entityId);
  }

  get menuItems() {
    if (!this.entity) return [];

    return entitySettingRegistry.getItemsForKind(this.entity.kind, this.entity.apiVersion, this.entity.metadata.source);
  }

  async componentDidMount() {
    const { hash } = navigation.location;

    this.ensureActiveTab();

    document.getElementById(hash.slice(1))?.scrollIntoView();
  }

  onTabChange = (tabId: string) => {
    this.activeTab = tabId;
  };

  renderNavigation() {
    return (
      <>
        <h2>{this.entity.metadata.name}</h2>
        <Tabs className="flex column" scrollable={false} onChange={this.onTabChange} value={this.activeTab}>
          <div className="header">Settings</div>
          { this.menuItems.map((setting) => (
            <Tab
              key={setting.id}
              value={setting.id}
              label={setting.title}
              data-testid={`${setting.id}-tab`}
            />
          ))}
        </Tabs>
      </>
    );
  }

  ensureActiveTab() {
    if (!this.activeTab) {
      this.activeTab = this.menuItems[0]?.id;
    }
  }

  render() {
    if (!this.entity) {
      console.error("entity not found", this.entityId);

      return null;
    }

    this.ensureActiveTab();
    const activeSetting = this.menuItems.find((setting) => setting.id === this.activeTab);

    return (
      <PageLayout
        className="CatalogEntitySettings"
        navigation={this.renderNavigation()}
        showOnTop={true}
        contentGaps={false}
      >
        <section>
          <h2 data-testid={`${activeSetting.id}-header`}>{activeSetting.title}</h2>
          <section>
            <activeSetting.components.View entity={this.entity} />
          </section>
        </section>
      </PageLayout>
    );
  }
}
