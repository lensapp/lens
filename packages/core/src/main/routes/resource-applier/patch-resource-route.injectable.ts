/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { payloadWithSchemaClusterRoute } from "../../router/route";
import resourceApplierInjectable from "../../resource-applier/create-resource-applier.injectable";
import { z } from "zod";
import type { Patch } from "rfc6902";

const patchResourcePayloadSchema = z.object({
  name: z.string(),
  kind: z.string(),
  ns: z.string().optional(),
  patch: z.array(z.object({
    op: z.string(),
    path: z.string(),
    value: z.any().optional(),
    from: z.string().optional(),
  })),
});

const patchResourceRouteInjectable = getRouteInjectable({
  id: "patch-resource-route",

  instantiate: (di) => payloadWithSchemaClusterRoute({
    method: "patch",
    path: `${apiPrefix}/stack`,
    payloadSchema: patchResourcePayloadSchema,
  })(async ({ cluster, payload }) => {
    const resourceApplier = di.inject(resourceApplierInjectable, cluster);

    return ({
      response: await resourceApplier.patch(
        payload.name,
        payload.kind,
        payload.patch as Patch,
        payload.ns,
      ),
    });
  }),
});

export default patchResourceRouteInjectable;
