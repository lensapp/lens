/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensMainExtensionParts } from "../../../extensions/lens-main-extension";
import { LensMainExtension } from "../../../extensions/lens-main-extension";
import type { LensRendererExtensionParts } from "../../../extensions/lens-renderer-extension";
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { SetRequired } from "type-fest";
import type { LensExtensionManifest } from "../../../features/extensions/common/installed-extension";

export class TestExtensionMain extends LensMainExtension {}
export class TestExtensionRenderer extends LensRendererExtension {}

type FakeManifest = SetRequired<Partial<LensExtensionManifest>, "name">;

export interface FakeExtensionOptions {
  id: string;
  manifest: FakeManifest;
  rendererOptions?: Partial<LensRendererExtensionParts>;
  mainOptions?: Partial<LensMainExtensionParts>;
}

export const getExtensionFakeForMain = ({ id, manifest, mainOptions: options = {}}: FakeExtensionOptions) => (
  Object.assign(
    new TestExtensionMain({
      id,
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: {
        version: "1.0.0",
        engines: {
          lens: "^5.5.0",
        },
        ...manifest,
      },
      manifestPath: "irrelevant",
    }),
    options,
  )
);

export const getExtensionFakeForRenderer = ({ id, manifest, rendererOptions: options = {}}: FakeExtensionOptions) => (
  Object.assign(
    new TestExtensionRenderer({
      id,
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: {
        version: "1.0.0",
        engines: {
          lens: "^5.5.0",
        },
        ...manifest,
      },
      manifestPath: "irrelevant",
    }),
    options,
  )
);
