/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./entity-settings.module.scss";

import React, { useEffect, useState } from "react";
import type { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { navigation } from "../../navigation";
import { Tabs, Tab } from "../tabs";
import { EntitySettingRegistry, RegisteredEntitySetting } from "../../../extensions/registries";
import type { EntitySettingsRouteParams } from "../../../common/routes";
import { groupBy } from "lodash";
import { SettingLayout } from "../layout/setting-layout";
import logger from "../../../common/logger";
import { Avatar } from "../avatar";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { CatalogEntity } from "../../../common/catalog";
import getEntityByIdInjectable from "../../catalog/get-entity-by-id.injectable";

export interface EntitySettingsProps extends RouteComponentProps<EntitySettingsRouteParams> {
}

interface Dependencies {
  getEntityById: (id: string) => CatalogEntity;
  getSettingsForEntity: (entity: CatalogEntity) => RegisteredEntitySetting[];
}

const NonInjectedEntitySettings = observer(({ getEntityById, match, getSettingsForEntity }: Dependencies & EntitySettingsProps) => {
  const { entityId } = match.params;
  const entity = getEntityById(entityId);
  const menuItems = getSettingsForEntity(entity);
  const [activeTab, setActiveTab] = useState(menuItems[0]?.id);

  useEffect(() => {
    const { hash } = navigation.location;

    if (hash) {
      const menuId = hash.slice(1);
      const item = menuItems.find((item) => item.id === menuId);

      if (item) {
        setActiveTab(item.id);
      }
    }
  }, []);

  const renderNavigation = () => {
    const groups = Object.entries(groupBy(menuItems, (item) => item.group || "Extensions"));

    groups.sort((a, b) => {
      if (a[0] === "Settings") return -1;
      if (a[0] === "Extensions") return 1;

      return a[0] <= b[0] ? -1 : 1;
    });

    return (
      <>
        <div className="flex items-center pb-8">
          <Avatar
            title={entity.metadata.name}
            colorHash={`${entity.metadata.name}-${entity.metadata.source}`}
            src={entity.spec.icon?.src}
            className={styles.settingsAvatar}
            size={40}
          />
          <div className={styles.entityName}>
            {entity.metadata.name}
          </div>
        </div>
        <Tabs
          className="flex column"
          scrollable={false}
          onChange={setActiveTab}
          value={activeTab}
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
  };

  if (!entity) {
    logger.error("[ENTITY-SETTINGS]: entity not found", entityId);

    return null;
  }

  const activeSetting = menuItems.find(item => item.id === activeTab);

  return (
    <SettingLayout
      navigation={renderNavigation()}
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
});

export const EntitySettings = withInjectables<Dependencies, EntitySettingsProps>(NonInjectedEntitySettings, {
  getProps: (di, props) => ({
    getEntityById: di.inject(getEntityByIdInjectable),
    getSettingsForEntity: (entity) => EntitySettingRegistry.getInstance().getItemsForKind(entity.kind, entity.apiVersion, entity.metadata.source),
    ...props,
  }),
});
