import type React from "react";
import { CatalogEntity } from "../../common/catalog-entity";
import { BaseRegistry } from "./base-registry";

export interface EntitySettingViewProps {
  entity: CatalogEntity;
}

export interface EntitySettingComponents {
  View: React.ComponentType<EntitySettingViewProps>;
}

export interface EntitySettingRegistration {
  title: string;
  kind: string;
  apiVersions: string[];
  source?: string;
  components: EntitySettingComponents;
  id?: string;
  priority?: number;
}

export interface RegisteredEntitySetting extends EntitySettingRegistration {
  id: string;
}

export class EntitySettingRegistry extends BaseRegistry<EntitySettingRegistration, RegisteredEntitySetting> {
  getRegisteredItem(item: EntitySettingRegistration): RegisteredEntitySetting {
    return {
      id: item.id || item.title.toLowerCase(),
      ...item,
    };
  }

  getItemsForKind(kind: string, apiVersion: string, source?: string) {
    let items = this.getItems().filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion);
    }).map((item) => {
      item.priority = item.priority ?? 50;

      return item;
    });

    if (source) {
      items = items.filter((item) => {
        return !item.source || item.source === source;
      });
    }

    return items.sort((a, b) => b.priority - a.priority);
  }
}

export const entitySettingRegistry = new EntitySettingRegistry();
