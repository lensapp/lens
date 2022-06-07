/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { NamespaceSelectFilterModel } from "./namespace-select-filter-model";
import { getInjectable } from "@ogre-tools/injectable";
import namespaceStoreInjectable from "../store.injectable";

const namespaceSelectFilterModelInjectable = getInjectable({
  id: "namespace-select-filter-model",

  instantiate: (di) => new NamespaceSelectFilterModel({
    namespaceStore: di.inject(namespaceStoreInjectable),
  }),
});

export default namespaceSelectFilterModelInjectable;
