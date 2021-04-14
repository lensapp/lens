import { LensApiRequest } from "../router";
import { LensApi } from "../lens-api";
import { ResourceApplier } from "../resource-applier";
import { assert } from "../../common/utils";
import { AssertionError } from "assert";
import logger from "../logger";

class ResourceApplierApiRoute extends LensApi {
  public async applyResource(request: LensApiRequest) {
    const { response, cluster: maybeCluster, payload } = request;

    try {
      const cluster = assert(maybeCluster, "No Cluster defined on request");
      const resource = await new ResourceApplier(cluster).apply(payload);

      this.respondJson(response, [resource], 200);
    } catch (error) {
      logger.error(`[RESOURCE-APPLIER-ROUTE]: routeServiceAccount failed: ${error}`);

      if (error instanceof AssertionError) {
        this.respondText(response, error.message, 404);
      } else {
        this.respondText(response, error, 422);
      }
    }
  }
}

export const resourceApplierRoute = new ResourceApplierApiRoute();
