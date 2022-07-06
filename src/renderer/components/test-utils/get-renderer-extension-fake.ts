/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SetRequired } from "type-fest";
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { ApplicationBuilder } from "./get-application-builder";
import { getExtensionFakeFor } from "./get-extension-fake";

export class TestExtension extends LensRendererExtension {}

export type FakeExtensionData = SetRequired<Partial<LensRendererExtension>, "id" | "name">;

export type GetRendererExtensionFake = (fakeExtensionData: FakeExtensionData) => TestExtension;

export const getRendererExtensionFakeFor = (
  builder: ApplicationBuilder,
): GetRendererExtensionFake => {
  const getExtensionFake = getExtensionFakeFor(builder);

  return ({ id, name, ...rest }) =>
    getExtensionFake({
      id,
      name,
      rendererOptions: rest,
    }).renderer;
};

