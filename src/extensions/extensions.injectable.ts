/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import extensionInstancesInjectable from "./extension-loader/extension-instances.injectable";

const extensionsInjectable = getInjectable({
  id: "extensions",
  instantiate: (di) => {
    const extensionInstances = di.inject(extensionInstancesInjectable);

    return computed(() => [...extensionInstances.values()].filter(extension => extension.isEnabled));
  },
});

export default extensionsInjectable;
