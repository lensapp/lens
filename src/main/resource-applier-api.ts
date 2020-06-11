import { LensApiRequest } from "./router"
import * as resourceApplier from "./resource-applier"
import { LensApi } from "./lens-api"

class ResourceApplierApi extends LensApi {
  public async applyResource(request: LensApiRequest) {
    const { response, cluster, payload } = request
    try {
      const resource = await resourceApplier.apply(cluster, cluster.proxyKubeconfigPath(), payload)
      this.respondJson(response, [resource], 200)
    } catch(error) {
      this.respondText(response, error, 422)
    }
  }
}

export const resourceApplierApi = new ResourceApplierApi()
