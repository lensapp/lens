/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./entity-settings.module.scss";

import React from "react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import { Tabs, Tab } from "../tabs";
import type { CatalogEntity } from "../../api/catalog-entity";
import { SettingLayout } from "../layout/setting-layout";
import { Avatar } from "../avatar";
import { withInjectables } from "@ogre-tools/injectable-react";
import currentCatalogEntityForSettingsInjectable from "./current-entity.injectable";
import type { ActiveEntitySettings } from "./active-tabs.injectable";
import activeEntitySettingsTabInjectable from "./active-tabs.injectable";

interface Dependencies {
  entity: IComputedValue<CatalogEntity | undefined>;
}

const NonInjectedEntitySettings = observer((props: Dependencies) => {
  const entity = props.entity.get();

  if (!entity) {
    return null;
  }

  return <CatalogEntitySettings entity={entity} />;
});

export const EntitySettingsRouteComponent = withInjectables<Dependencies>(NonInjectedEntitySettings, {
  getProps: (di) => ({
    entity: di.inject(currentCatalogEntityForSettingsInjectable),
  }),
});

interface CatalogEntitySettingsProps {
  entity: CatalogEntity;
}

interface CatalogEntitySettingsDeps {
  activeEntitySettingsTab: ActiveEntitySettings;
}

const NonInjectedCatalogEntitySettings = observer((props: CatalogEntitySettingsProps & CatalogEntitySettingsDeps) => {
  const {
    activeEntitySettingsTab,
    entity,
  } = props;
  const { tabId, setting, groups } = activeEntitySettingsTab.get();

  const renderNavigation = () => (
    <>
      <div className={styles.avatarAndName}>
        <Avatar
          title={entity.getName()}
          colorHash={`${entity.getName()}-${entity.metadata.source}`}
          src={entity.spec.icon?.src}
          className={styles.settingsAvatar}
          background={entity.spec.icon?.background}
          size={40}
        />
        <div className={styles.entityName}>
          {entity.getName()}
        </div>
      </div>
      <Tabs
        className="flex column"
        scrollable={ false }
        onChange={activeEntitySettingsTab.set}
        value={tabId}
      >
        {
          groups.map(({ tabs, title }) => (
            <React.Fragment key={title}>
              <hr />
              <div className="header">{title}</div>
              {
                tabs.map((setting) => (
                  <Tab
                    key={setting.id}
                    value={setting.id}
                    label={setting.title}
                    data-testid={`${setting.id}-tab`}
                  />
                ))
              }
            </React.Fragment>
          ))
        }
      </Tabs>
    </>
  );

  return (
    <SettingLayout
      navigation={renderNavigation()}
      contentGaps={false}
      data-testid="entity-settings"
    >
      {
        tabId && setting
          ? (
            <section>
              <h2 data-testid={`${tabId}-header`}>{setting.title}</h2>
              <section>
                <setting.components.View entity={entity} />
              </section>
            </section>
          )
          : (
            <div
              className="flex items-center"
              data-preference-page-does-not-exist-test={true}
            >
              No settings found for
              {" "}
              {entity.apiVersion}
              /
              {entity.kind}
            </div>
          )
      }
    </SettingLayout>
  );
});

const CatalogEntitySettings = withInjectables<CatalogEntitySettingsDeps, CatalogEntitySettingsProps>(NonInjectedCatalogEntitySettings, {
  getProps: (di, props) => ({
    ...props,
    activeEntitySettingsTab: di.inject(activeEntitySettingsTabInjectable, props.entity),
  }),
});
