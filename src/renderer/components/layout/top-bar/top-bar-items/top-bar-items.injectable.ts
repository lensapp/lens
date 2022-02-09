/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../../../extensions/renderer-extensions.injectable";

const topBarItemsInjectable = getInjectable({
  id: "top-bar-items",

  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() =>
      extensions.get().flatMap((extension) => extension.topBarItems),
    );
  },
});

export default topBarItemsInjectable;
