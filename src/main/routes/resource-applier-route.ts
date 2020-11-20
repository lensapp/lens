import { LensApiRequest } from "../router";
import { LensApi } from "../lens-api";
import { ResourceApplier } from "../resource-applier";

class ResourceApplierApiRoute extends LensApi {
  public async applyResource(request: LensApiRequest) {
    const { response, cluster, payload } = request;
    try {
      const resource = await new ResourceApplier(cluster).apply(payload);
      this.respondJson(response, [resource], 200);
    } catch (error) {
      this.respondText(response, error, 422);
    }
  }
}

export const resourceApplierRoute = new ResourceApplierApiRoute();
