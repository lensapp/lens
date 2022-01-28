/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { CustomResourceDefinitionApi } from "./custom-resource-definition.api";

const customResourceDefinitionApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/apiextensions.k8s.io/v1/customresourcedefinitions") as CustomResourceDefinitionApi,
  lifecycle: lifecycleEnum.singleton,
});

export default customResourceDefinitionApiInjectable;
