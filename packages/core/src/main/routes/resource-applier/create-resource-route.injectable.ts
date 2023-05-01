/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { payloadWithSchemaClusterRoute } from "../../router/route";
import resourceApplierInjectable from "../../resource-applier/create-resource-applier.injectable";
import { z } from "zod";

const createResourceRouteInjectable = getRouteInjectable({
  id: "create-resource-route",

  instantiate: (di) => payloadWithSchemaClusterRoute({
    method: "post",
    path: `${apiPrefix}/stack`,
    payloadSchema: z.string(),
  })(async ({ cluster, payload }) => {
    const resourceApplier = di.inject(resourceApplierInjectable, cluster);

    return ({
      response: await resourceApplier.create(payload),
    });
  }),
});

export default createResourceRouteInjectable;
