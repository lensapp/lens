/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import type { StatusBarRegistration } from "./status-bar-registration";

const bottomBarItemsInjectable = getInjectable({
  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() =>
      extensions
        .get()
        .flatMap((extension) => extension.statusBarItems)
        .sort(leftItemsBeforeRight),
    );
  },

  lifecycle: lifecycleEnum.singleton,
});

export default bottomBarItemsInjectable;

const leftItemsBeforeRight = (firstItem: StatusBarRegistration, secondItem: StatusBarRegistration) =>
  firstItem.components?.position?.localeCompare(secondItem.components?.position);
