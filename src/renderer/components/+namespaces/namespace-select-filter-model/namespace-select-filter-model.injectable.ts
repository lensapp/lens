/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { NamespaceSelectFilterModel } from "./namespace-select-filter-model";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import namespaceStoreInjectable from "../namespace-store/namespace-store.injectable";

const NamespaceSelectFilterModelInjectable = getInjectable({
  instantiate: (di) => new NamespaceSelectFilterModel({
    namespaceStore: di.inject(namespaceStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default NamespaceSelectFilterModelInjectable;
