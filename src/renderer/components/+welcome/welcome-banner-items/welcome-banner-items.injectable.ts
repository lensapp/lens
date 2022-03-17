/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { computed } from "mobx";

const welcomeBannerItemsInjectable = getInjectable({
  id: "welcome-banner-items",

  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => (
      extensions
        .get()
        .flatMap((extension) => extension.welcomeBanners)
    ));
  },
});

export default welcomeBannerItemsInjectable;
