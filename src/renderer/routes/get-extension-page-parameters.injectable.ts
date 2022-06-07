/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PageParam } from "../navigation";
import type { ExtensionPageParametersInstantiationParam } from "./extension-page-parameters.injectable";
import extensionPageParametersInjectable from "./extension-page-parameters.injectable";

export type GetExtensionPageParameters = (param: ExtensionPageParametersInstantiationParam) => Record<string, PageParam<unknown>>;

const getExtensionPageParametersInjectable = getInjectable({
  id: "get-extension-page-parameters",
  instantiate: (di): GetExtensionPageParameters => (param) => di.inject(extensionPageParametersInjectable, param),
});

export default getExtensionPageParametersInjectable;
