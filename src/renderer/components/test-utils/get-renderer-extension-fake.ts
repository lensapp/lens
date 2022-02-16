/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";

export class TestExtension extends LensRendererExtension {}

export const getRendererExtensionFake = ({ id, ...rest }: Partial<LensRendererExtension>) => {
  const instance = new TestExtension({
    id,
    absolutePath: "irrelevant",
    isBundled: false,
    isCompatible: false,
    isEnabled: false,
    manifest: { name: id, version: "some-version" },
    manifestPath: "irrelevant",
  });

  Object.assign(instance, rest);

  return instance;
};
