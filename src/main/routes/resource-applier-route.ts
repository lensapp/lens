import { LensApiRequest } from "../router";
import { respondJson, respondText } from "../utils/http-responses";
import { ResourceApplier } from "../resource-applier";

export class ResourceApplierApiRoute {
  static async applyResource(request: LensApiRequest) {
    const { response, cluster, payload } = request;

    try {
      const resource = await new ResourceApplier(cluster).apply(payload);

      respondJson(response, [resource], 200);
    } catch (error) {
      respondText(response, error, 422);
    }
  }
}
