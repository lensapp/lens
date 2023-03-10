/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { urlBuilderFor } from "@k8slens/utilities";
import apiBaseInjectable from "../../api-base.injectable";

export interface HelmReleaseRevision {
  revision: number;
  updated: string;
  status: string;
  chart: string;
  app_version: string;
  description: string;
}

export type RequestHelmReleaseHistory = (name: string, namespace: string) => Promise<HelmReleaseRevision[]>;

const requestHistoryEnpoint = urlBuilderFor("/v2/releases/:namespace/:name/history");

const requestHelmReleaseHistoryInjectable = getInjectable({
  id: "request-helm-release-history",
  instantiate: (di): RequestHelmReleaseHistory => {
    const apiBase = di.inject(apiBaseInjectable);

    return (name, namespace) => apiBase.get(requestHistoryEnpoint.compile({ name, namespace }));
  },
});

export default requestHelmReleaseHistoryInjectable;
