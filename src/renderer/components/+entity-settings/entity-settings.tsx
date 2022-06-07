/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./entity-settings.module.scss";

import React from "react";
import type { IComputedValue } from "mobx";
import { observable, makeObservable, computed } from "mobx";
import { observer } from "mobx-react";
import { Tabs, Tab } from "../tabs";
import type { CatalogEntity } from "../../api/catalog-entity";
import type { CatalogEntityRegistry } from "../../api/catalog/entity/registry";
import { EntitySettingRegistry } from "../../../extensions/registries";
import { groupBy } from "lodash";
import { SettingLayout } from "../layout/setting-layout";
import logger from "../../../common/logger";
import { Avatar } from "../avatar";
import { withInjectables } from "@ogre-tools/injectable-react";
import entitySettingsRouteParametersInjectable from "./entity-settings-route-parameters.injectable";
import type { ObservableHistory } from "mobx-observable-history";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";

interface Dependencies {
  entityId: IComputedValue<string>;
  entityRegistry: CatalogEntityRegistry;
  observableHistory: ObservableHistory<unknown>;
}

@observer
class NonInjectedEntitySettings extends React.Component<Dependencies> {
  @observable activeTab?: string;

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);

    const { hash } = this.props.observableHistory.location;

    if (hash) {
      const menuId = hash.slice(1);
      const item = this.menuItems.find((item) => item.id === menuId);

      if (item) {
        this.activeTab = item.id;
      }
    }
  }

  @computed
  get entityId() {
    return this.props.entityId.get();
  }

  get entity() {
    return this.props.entityRegistry.getById(this.entityId);
  }

  get menuItems() {
    if (!this.entity) return [];

    return EntitySettingRegistry.getInstance().getItemsForKind(this.entity.kind, this.entity.apiVersion, this.entity.metadata.source);
  }

  get activeSetting() {
    this.activeTab ||= this.menuItems[0]?.id;

    return this.menuItems.find((setting) => setting.id === this.activeTab);
  }

  onTabChange = (tabId: string) => {
    this.activeTab = tabId;
  };

  renderNavigation(entity: CatalogEntity) {
    const groups = Object.entries(groupBy(this.menuItems, (item) => item.group || "Extensions"));

    groups.sort((a, b) => {
      if (a[0] === "Settings") return -1;
      if (a[0] === "Extensions") return 1;

      return a[0] <= b[0] ? -1 : 1;
    });

    return (
      <>
        <div className="flex items-center pb-8">
          <Avatar
            title={entity.getName()}
            colorHash={`${entity.getName()}-${entity.metadata.source}`}
            src={entity.spec.icon?.src}
            className={styles.settingsAvatar}
            size={40}
          />
          <div className={styles.entityName}>
            {entity.getName()}
          </div>
        </div>
        <Tabs
          className="flex column"
          scrollable={false}
          onChange={this.onTabChange}
          value={this.activeTab}
        >
          { groups.map((group, groupIndex) => (
            <React.Fragment key={`group-${groupIndex}`}>
              <hr/>
              <div className="header">{group[0]}</div>
              { group[1].map((setting, index) => (
                <Tab
                  key={index}
                  value={setting.id}
                  label={setting.title}
                  data-testid={`${setting.id}-tab`}
                />
              ))}
            </React.Fragment>
          ))}
        </Tabs>
      </>
    );
  }

  render() {
    const { activeSetting, entity } = this;

    if (!entity) {
      logger.error("[ENTITY-SETTINGS]: entity not found", this.entityId);

      return null;
    }

    return (
      <SettingLayout
        navigation={this.renderNavigation(entity)}
        contentGaps={false}
      >
        {
          activeSetting && (
            <section>
              <h2 data-testid={`${activeSetting.id}-header`}>{activeSetting.title}</h2>
              <section>
                <activeSetting.components.View entity={entity} key={activeSetting.title} />
              </section>
            </section>
          )
        }
      </SettingLayout>
    );
  }
}

export const EntitySettings = withInjectables<Dependencies>(NonInjectedEntitySettings, {
  getProps: (di) => ({
    ...di.inject(entitySettingsRouteParametersInjectable),
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
    observableHistory: di.inject(observableHistoryInjectable),
  }),
});
