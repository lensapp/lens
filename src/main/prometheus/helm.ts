/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { PrometheusLens } from "./lens";
import type { CoreV1Api } from "@kubernetes/client-node";
import type { PrometheusService } from "./provider-registry";
import logger from "../logger";

export class PrometheusHelm extends PrometheusLens {
  id = "helm";
  name = "Helm";
  rateAccuracy = "5m";

  public async getPrometheusService(client: CoreV1Api): Promise<PrometheusService | void> {
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
