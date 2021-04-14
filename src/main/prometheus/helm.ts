import { PrometheusLens } from "./lens";
import { CoreV1Api } from "@kubernetes/client-node";
import { PrometheusService } from "./provider-registry";
import logger from "../logger";

export class PrometheusHelm extends PrometheusLens {
  id = "helm";
  name = "Helm";
  rateAccuracy = "5m";

  public async getPrometheusService(client: CoreV1Api): Promise<PrometheusService | undefined> {
    const labelSelector = "app=prometheus,component=server,heritage=Helm";

    try {
      const serviceList = await client.listServiceForAllNamespaces(false, "", undefined, labelSelector);

      return super.getPrometheusServiceRaw(serviceList.body.items[0]);
    } catch(error) {
      logger.warn(`PrometheusHelm: failed to list services: ${error.toString()}`);
    }
  }
}
