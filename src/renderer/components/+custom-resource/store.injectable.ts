/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { CustomResourceDefinitionStore } from "./store";

const customResourceDefinitionStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/apis/apiextensions.k8s.io/v1/customresourcedefinitions") as CustomResourceDefinitionStore,
  lifecycle: lifecycleEnum.singleton,
});

export default customResourceDefinitionStoreInjectable;
