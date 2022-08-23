/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { getRouteInjectable } from "../../../router/router.injectable";
import Joi from "joi";
import { payloadValidatedClusterRoute } from "../../../router/route";
import rollbackHelmReleaseInjectable from "../../../helm/helm-service/rollback-helm-release.injectable";

interface RollbackReleasePayload {
  revision: number;
}

const rollbackReleasePayloadValidator = Joi.object<RollbackReleasePayload, true, RollbackReleasePayload>({
  revision: Joi
    .number()
    .required(),
});

const rollbackReleaseRouteInjectable = getRouteInjectable({
  id: "rollback-release-route",

  instantiate: (di) => {
    const rollbackRelease = di.inject(rollbackHelmReleaseInjectable);

    return payloadValidatedClusterRoute({
      method: "put",
      path: `${apiPrefix}/v2/releases/{namespace}/{release}/rollback`,
      payloadValidator: rollbackReleasePayloadValidator,
    })(async ({ cluster, params: { release, namespace }, payload }) => {
      await rollbackRelease(cluster, release, namespace, payload.revision);
    });
  },
});

export default rollbackReleaseRouteInjectable;
