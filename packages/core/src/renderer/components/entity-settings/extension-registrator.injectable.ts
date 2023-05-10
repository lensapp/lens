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
  apiVersions: string[];
  kind: string;
  title: string;
  components: EntitySettingComponents;
  source?: string;
  id?: string;
  priority?: number;
  group?: string;
}

export interface RegisteredEntitySetting {
  id: string;
  orderNumber: number;
  apiVersions: Set<string>;
  kind: string;
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
  id = btoa(title),
  priority,
  source,
}: EntitySettingRegistration) => getInjectable({
  id: `${extension.manifest.name}:${group}/${kind}:${id}`,
  instantiate: () => ({
    apiVersions: new Set(apiVersions),
    components,
    id,
    kind,
    orderNumber: priority ?? 50,
    title,
    group,
    source,
  }),
  injectionToken: entitySettingInjectionToken,
});
