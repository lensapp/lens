/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionsStoreInjectable from "../../extensions-store/extensions-store.injectable";

const getEnabledExtensionsInjectable = getInjectable({
  id: "get-enabled-extensions",

  instantiate: (di) => () =>
    di.inject(extensionsStoreInjectable).enabledExtensions,
});

export default getEnabledExtensionsInjectable;
