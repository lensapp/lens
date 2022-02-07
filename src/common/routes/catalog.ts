/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, RouteProps } from "../utils/buildUrl";

export interface CatalogViewRouteParam {
  group?: string;
  kind?: string;
}
export const catalogRoute: RouteProps = {
  path: "/catalog/:group?/:kind?",
};

export const getPreviousTabUrl = (path: string) => {
  const [group, kind] = path.split("/");

  return catalogURL({
    params: {
      group: group || browseCatalogTab,
      kind,
    },
  });
};

export const catalogURL = buildURL<CatalogViewRouteParam>(catalogRoute.path);

export const browseCatalogTab = "browse";
