/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";

const statusBarItemsInjectable = getInjectable({
  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => (
      extensions.get()
        .flatMap(ext => ext.statusBarItems)
    ));
  },
  lifecycle: lifecycleEnum.singleton,
});

export default statusBarItemsInjectable;
