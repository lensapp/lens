/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PageParam } from "../navigation/page-param";
import type { ExtensionPageParametersInstantiationParam } from "./extension-page-parameters.injectable";
import extensionPageParametersInjectable from "./extension-page-parameters.injectable";

export type GetExtensionPageParameters = ReturnType<typeof getExtensionPageParametersInjectable["instantiate"]>;

const getExtensionPageParametersInjectable = getInjectable({
  id: "get-extension-page-parameters",
  instantiate: (di) => <Param>(param: ExtensionPageParametersInstantiationParam<Param>) => di.inject(extensionPageParametersInjectable, param as ExtensionPageParametersInstantiationParam<unknown>) as Record<string, PageParam<Param>>,
});

export default getExtensionPageParametersInjectable;
