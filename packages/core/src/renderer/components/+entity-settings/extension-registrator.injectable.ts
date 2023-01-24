/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { CatalogEntity } from "../../api/catalog-entity";
import { entitySettingInjectionToken } from "./token";

export interface EntitySettingViewProps {
  entity: CatalogEntity;
}

export interface EntitySettingComponents {
  View: React.ComponentType<EntitySettingViewProps>;
}

export interface EntitySettingRegistration {
  /**
   * The list of apiVersions for this setting. This is an additive list. If the
   * value is `"*"` then it will match all versions.
   */
  apiVersions: string[] | "*";

  /**
   * The kind of entity. If this is `"*"` then it will match all kinds.
   */
  kind: string;

  /**
   * The heading for this setting
   */
  title: string;
  components: EntitySettingComponents;

  /**
   * If set then only entities with `.source` matching this value will have
   * this setting.
   */
  source?: string;

  /**
   * The ID for the setting area for use with navigation links. If not provided
   * then it will default to the lowercase version of `.title`.
   */
  id?: string;

  /**
   * The sorting order placement for this component.
   *
   * @default 50
   */
  priority?: number;

  /**
   * The section of the settings to be put under.
   */
  group?: string;
}

export interface RegisteredEntitySetting {
  id: string;
  orderNumber: number;
  isFor: (entity: CatalogEntity) => boolean;
  title: string;
  components: EntitySettingComponents;
  source?: string;
  group: string;
}

const entitySettingExtensionRegistratorInjectable = getInjectable({
  id: "entity-setting-extension-registrator",
  instantiate: () => (ext) => {
    const extension = ext as LensRendererExtension;

    return extension.entitySettings.map(getInjectableForEntitySettingRegistrationFor(extension));
  },
  injectionToken: extensionRegistratorInjectionToken,
});

export default entitySettingExtensionRegistratorInjectable;

const getInjectableForEntitySettingRegistrationFor = (extension: LensRendererExtension) => ({
  apiVersions,
  components,
  kind,
  title,
  group = "Extensions",
  id = title.toLowerCase(),
  priority,
  source,
}: EntitySettingRegistration) => getInjectable({
  id: `${extension.manifest.name}:${group}/${kind}:${id}`,
  instantiate: (): RegisteredEntitySetting => {
    return {
      isFor: entity => (
        (apiVersions === "*" || apiVersions.includes(entity.apiVersion))
        && (kind === "*" || entity.kind === kind)
      ),
      components,
      id,
      orderNumber: priority ?? 50,
      title,
      group,
      source,
    };
  },
  injectionToken: entitySettingInjectionToken,
});
