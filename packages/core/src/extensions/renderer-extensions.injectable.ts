/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import extensionsInjectable from "./extensions.injectable";
import type { LensRendererExtension } from "./lens-renderer-extension";

const rendererExtensionsInjectable = getInjectable({
  id: "renderer-extensions",
  instantiate: (di) => di.inject(extensionsInjectable) as IComputedValue<LensRendererExtension[]>,
});

export default rendererExtensionsInjectable;
