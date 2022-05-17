/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { helmService } from "../../../helm/helm-service";
import { getRouteInjectable } from "../../../router/router.injectable";
import Joi from "joi";
import { payloadValidatedClusterRoute } from "../../../router/route";

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

  instantiate: () => payloadValidatedClusterRoute({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}/rollback`,
    payloadValidator: rollbackReleasePayloadValidator,
  })(async ({ cluster, params: { release, namespace }, payload }) => {
    await helmService.rollback(cluster, release, namespace, payload.revision);
  }),
});

export default rollbackReleaseRouteInjectable;
