/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { JsonApiData } from "../../../common/k8s-api/json-api";
import { buildURLPositional } from "../../../common/utils/buildUrl";
import releasesInjectable from "../../components/+helm-releases/releases.injectable";
import apiBaseInjectable from "../api-base.injectable";

export type RollbackHelmRelease = (name: string, namespace: string, revision: number) => Promise<JsonApiData>;

const rollbackHelmReleaseUrl = buildURLPositional<{ namespace: string; name: string }>("/v2/releases/:namespace/:name/rollback");

const rollbackHelmReleaseInjectable = getInjectable({
  id: "rollback-helm-release",
  instantiate: (di): RollbackHelmRelease => {
    const apiBase = di.inject(apiBaseInjectable);
    const releases = di.inject(releasesInjectable);

    return async (name, namespace, revision) => {
      const result = await apiBase.put(
        rollbackHelmReleaseUrl({ name, namespace }),
        { data: { revision }},
      );

      releases.invalidate();

      return result;
    };
  },
});

export default rollbackHelmReleaseInjectable;
