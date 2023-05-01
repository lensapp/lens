/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { getRouteInjectable } from "../../../router/router.injectable";
import { payloadWithSchemaClusterRoute } from "../../../router/route";
import updateHelmReleaseInjectable from "../../../helm/helm-service/update-helm-release.injectable";
import { z } from "zod";

const updateChartArgsSchema = z.object({
  chart: z.string(),
  version: z.string(),
  values: z.string(),
});

const updateReleaseRouteInjectable = getRouteInjectable({
  id: "update-release-route",

  instantiate: (di) => {
    const updateRelease = di.inject(updateHelmReleaseInjectable);

    return payloadWithSchemaClusterRoute({
      method: "put",
      path: `${apiPrefix}/v2/releases/{namespace}/{release}`,
      payloadSchema: updateChartArgsSchema,
    })(async ({ cluster, params, payload }) => ({
      response: await updateRelease(
        cluster,
        params.release,
        params.namespace,
        payload,
      ),
    }));
  },
});

export default updateReleaseRouteInjectable;
