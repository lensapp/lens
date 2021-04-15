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

  async componentDidMount() {
    const { hash } = navigation.location;

    console.log(this.entityId, this.entity);


    this.activeTab = entitySettingRegistry.getItems()[0]?.id;

    document.getElementById(hash.slice(1))?.scrollIntoView();
  }

  onTabChange = (tabId: string) => {
    this.activeTab = tabId;
  };

  renderNavigation() {
    const settings = entitySettingRegistry.getItems();

    return (
      <>
        <h2>{this.entity.metadata.name}</h2>
        <Tabs className="flex column" scrollable={false} onChange={this.onTabChange} value={this.activeTab}>
          <div className="header">Settings</div>
          { settings.map((setting) => {
            return <Tab key={setting.id} value={setting.id} label={setting.title} data-testid={`${setting.id}-tab`} />;
          })}
        </Tabs>
      </>
    );
  }

  render() {
    if (!this.entity) return null;

    const activeSetting = entitySettingRegistry.getItems().find((setting) => setting.id === this.activeTab);

    if (!activeSetting) {
      return null;
    }

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
