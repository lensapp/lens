/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { NamespaceApi } from "./namespace.api";

const namespaceApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/api/v1/namespaces") as NamespaceApi,
  lifecycle: lifecycleEnum.singleton,
});

export default namespaceApiInjectable;
