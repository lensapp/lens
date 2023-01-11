/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { urlBuilderFor } from "../../../utils/buildUrl";
import apiBaseInjectable from "../../api-base.injectable";
import type { HelmReleaseDto } from "../helm-releases.api";

export type RequestHelmReleases = (namespace?: string) => Promise<HelmReleaseDto[]>;

const requestHelmReleasesEndpoint = urlBuilderFor("/v2/releases/:namespace?");

const requestHelmReleasesInjectable = getInjectable({
  id: "request-helm-releases",

  instantiate: (di): RequestHelmReleases => {
    const apiBase = di.inject(apiBaseInjectable);

    return (namespace) => apiBase.get(requestHelmReleasesEndpoint.compile({ namespace }));
  },
});

export default requestHelmReleasesInjectable;
