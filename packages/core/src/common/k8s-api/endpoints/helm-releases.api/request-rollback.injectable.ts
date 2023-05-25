/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { urlBuilderFor } from "@k8slens/utilities";
import apiBaseInjectable from "../../api-base.injectable";

export type RequestHelmReleaseRollback = (name: string, namespace: string, revision: number) => Promise<void>;

const requestRollbackEndpoint = urlBuilderFor("/v2/releases/:namespace/:name/rollback");

const requestHelmReleaseRollbackInjectable = getInjectable({
  id: "request-helm-release-rollback",
  instantiate: (di): RequestHelmReleaseRollback => {
    const apiBase = di.inject(apiBaseInjectable);

    return async (name, namespace, revision) => {
      await apiBase.put(
        requestRollbackEndpoint.compile({ name, namespace }),
        { data: { revision }},
      );
    };
  },
});

export default requestHelmReleaseRollbackInjectable;
