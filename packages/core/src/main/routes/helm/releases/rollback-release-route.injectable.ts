/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { getRouteInjectable } from "../../../router/router.injectable";
import { payloadWithSchemaClusterRoute } from "../../../router/route";
import rollbackClusterHelmReleaseInjectable from "../../../helm/helm-service/rollback-helm-release.injectable";
import { z } from "zod";

const rollbackReleasePayloadValidator = z.object({
  revision: z.number(),
});

const rollbackReleaseRouteInjectable = getRouteInjectable({
  id: "rollback-release-route",

  instantiate: (di) => {
    const rollbackRelease = di.inject(rollbackClusterHelmReleaseInjectable);

    return payloadWithSchemaClusterRoute({
      method: "put",
      path: `${apiPrefix}/v2/releases/{namespace}/{name}/rollback`,
      payloadSchema: rollbackReleasePayloadValidator,
    })(async ({ cluster, params, payload }) => {
      await rollbackRelease(cluster, { ...params, ...payload });
    });
  },
});

export default rollbackReleaseRouteInjectable;
