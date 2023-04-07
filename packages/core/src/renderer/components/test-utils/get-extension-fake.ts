/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { LensMainExtension } from "../../../extensions/lens-main-extension";
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";

export class TestExtensionMain extends LensMainExtension {}
export class TestExtensionRenderer extends LensRendererExtension {}

export interface FakeExtensionOptions {
  id: string;
  name: string;
  rendererOptions?: Partial<LensRendererExtension>;
  mainOptions?: Partial<LensMainExtension>;
}

export const getExtensionFakeForMain = ({ id, name, mainOptions = {}}: FakeExtensionOptions) => (
  Object.assign(
    new TestExtensionMain({
      id,
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: {
        name,
        version: "1.0.0",
        engines: {
          lens: "^5.5.0",
        },
      },
      manifestPath: "irrelevant",
    }),
    mainOptions,
  )
);

export const getExtensionFakeForRenderer = ({ id, name, rendererOptions = {}}: FakeExtensionOptions) => (
  Object.assign(
    new TestExtensionRenderer({
      id,
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: {
        name,
        version: "1.0.0",
        engines: {
          lens: "^5.5.0",
        },
      },
      manifestPath: "irrelevant",
    }),
    rendererOptions,
  )
);
