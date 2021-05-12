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
import { groupBy } from "lodash";

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

    if (hash) {
      const item = this.menuItems.find((item) => item.title === hash.slice(1));

      if (item) {
        this.activeTab = item.id;
      }
    }

    this.ensureActiveTab();
  }

  onTabChange = (tabId: string) => {
    this.activeTab = tabId;
  };

  renderNavigation() {
    const groups = Object.entries(groupBy(this.menuItems, (item) => item.group || "Extensions"));

    return (
      <>
        <h2>{this.entity.metadata.name}</h2>
        <Tabs className="flex column" scrollable={false} onChange={this.onTabChange} value={this.activeTab}>
          { groups.map((group) => (
            <>
              <div className="header">{group[0]}</div>
              { group[1].map((setting) => (
                <Tab
                  key={setting.id}
                  value={setting.id}
                  label={setting.title}
                  data-testid={`${setting.id}-tab`}
                />
              ))}
            </>
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
