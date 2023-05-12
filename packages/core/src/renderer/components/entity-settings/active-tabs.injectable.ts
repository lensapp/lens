/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { action } from "mobx";
import { byOrderNumber } from "@k8slens/utilities";
import type { CatalogEntity } from "../../api/catalog-entity";
import { observableHistoryInjectionToken } from "@k8slens/routing";
import type { RegisteredEntitySetting } from "./extension-registrator.injectable";
import catalogEntitySettingItemsInjectable from "./settings.injectable";

export interface SettingTabs {
  title: string;
  id: string;
}

export interface SettingGroup {
  title: string;
  tabs: SettingTabs[];
}

export interface ActiveEntitySettingDetails {
  tabId: string | undefined;
  setting: RegisteredEntitySetting | undefined;
  groups: SettingGroup[];
}

export interface ActiveEntitySettings {
  get: () => ActiveEntitySettingDetails;
  set: (tabId: string) => void;
}

const settingsGroup = "Settings";
const defaultExtensionsGroup = "Extensions";

const getSettingGroups = (items: RegisteredEntitySetting[]): SettingGroup[] => {
  const groupNames = new Set(items.map(({ group }) => group));
  const titles = [...groupNames].sort((left, right) => {
    if (left === settingsGroup) return -1;
    if (left === defaultExtensionsGroup) return 1;

    return left <= right ? -1 : 1;
  });

  return titles.map(title => ({
    title,
    tabs: items
      .filter(({ group }) => group === title)
      .sort(byOrderNumber),
  }));
};

const activeEntitySettingsTabInjectable = getInjectable({
  id: "active-entity-settings-tab",
  instantiate: (di, entity): ActiveEntitySettings => {
    const observableHistory = di.inject(observableHistoryInjectionToken);
    const items = di.inject(catalogEntitySettingItemsInjectable, entity);

    return {
      get: () => {
        const defaultTabId = items.get()[0]?.id;
        const tabId = observableHistory.location.hash.slice(1) || defaultTabId;
        const setting = items.get().find(({ id }) => id === tabId);
        const groups = getSettingGroups(items.get());

        return { tabId, setting, groups };
      },
      set: action((tabId) => {
        observableHistory.merge({ hash: tabId }, true);
      }),
    };
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, entity: CatalogEntity) => `${entity.apiVersion}/${entity.kind}[${entity.metadata.source ?? ""}]`,
  }),
});

export default activeEntitySettingsTabInjectable;
