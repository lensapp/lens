/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getExtensionRouteId } from "./get-extension-route-id";
import { getSanitizedPath } from "../../extensions/lens-extension";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";

export const getExtensionRoutePath = (
  extension: LensRendererExtension,
  pageId?: string,
) => {
  const routeId = getExtensionRouteId(
    extension.sanitizedExtensionId,
    pageId,
  );

  return getSanitizedPath("/extension", routeId);
};
