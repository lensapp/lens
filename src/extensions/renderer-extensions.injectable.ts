/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import extensionsInjectable from "./extensions.injectable";
import type { LensRendererExtension } from "./lens-renderer-extension";

const rendererExtensionsInjectable = getInjectable({
  instantiate: (di) => di.inject(extensionsInjectable) as IComputedValue<LensRendererExtension[]>,
  lifecycle: lifecycleEnum.singleton,
});

export default rendererExtensionsInjectable;
