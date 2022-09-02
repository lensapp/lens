/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RegisteredEntitySetting } from "../../../../extensions/registries";
import { EntitySettingRegistry } from "../../../../extensions/registries";

export type GetEntitySettingCommands = (kind: string, apiVersion: string, source?: string) => RegisteredEntitySetting[];

const getEntitySettingCommandsInjectable = getInjectable({
  id: "get-entity-setting-commands",
  instantiate: (): GetEntitySettingCommands => {
    const reg = EntitySettingRegistry.getInstance();

    return (kind, apiVersion, source) => reg.getItemsForKind(kind, apiVersion, source);
  },
  causesSideEffects: true,
});

export default getEntitySettingCommandsInjectable;
