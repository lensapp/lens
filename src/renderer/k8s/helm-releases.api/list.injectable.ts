/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import apiBaseInjectable from "../api-base.injectable";
import type { HelmRelease, RawHelmRelease } from "../helm-release";
import { helmReleasesUrl } from "../helm-releases.api";
import toHelmReleaseInjectable from "./to-instance.injectable";

export type ListHelmReleases = (namespace?: string) => Promise<HelmRelease[]>;

const listHelmReleasesInjectable = getInjectable({
  id: "list-helm-releases",
  instantiate: (di): ListHelmReleases => {
    const apiBase = di.inject(apiBaseInjectable);
    const toHelmRelease = di.inject(toHelmReleaseInjectable);

    return async (namespace) => {
      const releases = await apiBase.get<RawHelmRelease[]>(helmReleasesUrl({ namespace }));

      return releases.map(toHelmRelease);
    };
  },
});

export default listHelmReleasesInjectable;
