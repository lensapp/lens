import { PrometheusLens } from "./lens";
import { CoreV1Api } from "@kubernetes/client-node";
import { PrometheusService } from "./provider-registry";
import logger from "../logger";

export class PrometheusHelm extends PrometheusLens {
  id = "helm";
  name = "Helm";
  rateAccuracy = "5m";

  public async getPrometheusService(client: CoreV1Api): Promise<PrometheusService> {
    const labelSelector = "app=prometheus,component=server,heritage=Helm";

    try {
      const serviceList = await client.listServiceForAllNamespaces(false, "", null, labelSelector);
      const service = serviceList.body.items[0];

      if (!service) return;

      return {
        id: this.id,
        namespace: service.metadata.namespace,
        service: service.metadata.name,
        port: service.spec.ports[0].port
      };
    } catch(error) {
      logger.warn(`PrometheusHelm: failed to list services: ${error.toString()}`);

      return;
    }
  }
}
