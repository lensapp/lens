/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { iter } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import isExtensionEnabledInjectable from "../features/extensions/enabled/common/is-enabled.injectable";
import extensionInstancesInjectable from "./extension-loader/extension-instances.injectable";

const extensionsInjectable = getInjectable({
  id: "extensions",
  instantiate: (di) => {
    const extensionInstances = di.inject(extensionInstancesInjectable);
    const isExtensionEnabled = di.inject(isExtensionEnabledInjectable);

    return computed(() => (
      iter.chain(extensionInstances.values())
        .filter(extension => extension.isBundled || isExtensionEnabled(extension.id))
        .toArray()
    ));
  },
});

export default extensionsInjectable;
