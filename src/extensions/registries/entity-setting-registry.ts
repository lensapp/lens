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
      id: item.id || item.title.toLowerCase().replace(/[^0-9a-zA-Z]+/g, "-"),
      ...item,
    };
  }
}

export const entitySettingRegistry = new EntitySettingRegistry();
