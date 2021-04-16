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
  id?: string;
  components: EntitySettingComponents;
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
    const items = this.getItems().filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion);
    });

    if (source) {
      return items.filter((item) => {
        return !item.source || item.source === source;
      });
    } else {
      return items;
    }
  }
}

export const entitySettingRegistry = new EntitySettingRegistry();
