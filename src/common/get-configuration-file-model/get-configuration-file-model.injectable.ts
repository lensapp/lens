/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import Config from "conf";
import type { BaseStoreParams } from "../base-store";

const getConfigurationFileModelInjectable = getInjectable({
  id: "get-configuration-file-model",
  instantiate: () => <T extends object>(content: BaseStoreParams<T>) => new Config(content),
  causesSideEffects: true,
});

export default getConfigurationFileModelInjectable;
