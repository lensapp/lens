/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { buildURLPositional } from "../../../common/utils/buildUrl";
import apiBaseInjectable from "../api-base.injectable";

export interface HelmReleaseRevision {
  revision: number;
  updated: string;
  status: string;
  chart: string;
  app_version: string;
  description: string;
}

export type GetHelmReleaseHistory = (name: string, namespace: string) => Promise<HelmReleaseRevision[]>;

const getHelmReleaseHistoryUrl = buildURLPositional<{ namespace: string; name: string }>("/v2/releases/:namespace/:name/history");

const getHelmReleaseHistoryInjectable = getInjectable({
  id: "get-helm-release-history",
  instantiate: (di): GetHelmReleaseHistory => {
    const apiBase = di.inject(apiBaseInjectable);

    return (name, namespace) => apiBase.get(getHelmReleaseHistoryUrl({ name, namespace }));
  },
});

export default getHelmReleaseHistoryInjectable;
