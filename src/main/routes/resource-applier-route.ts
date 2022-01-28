/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensApiRequest } from "../router/router";
import { respondJson, respondText } from "../utils/http-responses";
import { ResourceApplier } from "../resource-applier";

export class ResourceApplierApiRoute {
  static async applyResource(request: LensApiRequest) {
    const { response, cluster, payload } = request;

    try {
      const resource = await new ResourceApplier(cluster).apply(payload);

      respondJson(response, resource, 200);
    } catch (error) {
      respondText(response, error, 422);
    }
  }

  static async patchResource(request: LensApiRequest) {
    const { response, cluster, payload } = request;

    try {
      const resource = await new ResourceApplier(cluster).patch(payload.name, payload.kind, payload.patch, payload.ns);

      respondJson(response, resource, 200);
    } catch (error) {
      respondText(response, error, 422);
    }
  }
}
