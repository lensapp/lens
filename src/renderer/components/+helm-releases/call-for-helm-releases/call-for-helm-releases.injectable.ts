/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmReleaseDto } from "../../../../common/k8s-api/endpoints/helm-releases.api";

import { apiBase } from "../../../../common/k8s-api";
import { endpoint } from "../../../../common/k8s-api/endpoints/helm-releases.api";

export type CallForHelmReleases = (
  namespace?: string
) => Promise<HelmReleaseDto[]>;

const callForHelmReleasesInjectable = getInjectable({
  id: "call-for-helm-releases",

  instantiate: (): CallForHelmReleases => async (namespace) =>
    await apiBase.get<HelmReleaseDto[]>(endpoint({ namespace })),

  causesSideEffects: true,
});

export default callForHelmReleasesInjectable;
