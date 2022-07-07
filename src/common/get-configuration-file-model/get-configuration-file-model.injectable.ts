/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import Config from "conf";
import type { BaseStoreParams } from "../base-store";

export type GetConfigurationFileModel = <T>(content: BaseStoreParams<T>) => Config<T>;

const getConfigurationFileModelInjectable = getInjectable({
  id: "get-configuration-file-model",
  instantiate: (): GetConfigurationFileModel => (content) => new Config(content),
  causesSideEffects: true,
});

export default getConfigurationFileModelInjectable;
