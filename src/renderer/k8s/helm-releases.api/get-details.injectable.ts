/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import apiBaseInjectable from "../api-base.injectable";
import type { HelmReleaseDetails } from "../helm-releases.api";
import { helmReleasesUrl } from "../helm-releases.api";

export type GetHelmReleaseDetails = (name: string, namespace: string) => Promise<HelmReleaseDetails>;

const getHelmReleaseDetailsInjectable = getInjectable({
  id: "get-helm-release-details",
  instantiate: (di): GetHelmReleaseDetails => {
    const apiBase = di.inject(apiBaseInjectable);

    return (name, namespace) => apiBase.get(helmReleasesUrl({ name, namespace }));
  },
});

export default getHelmReleaseDetailsInjectable;
