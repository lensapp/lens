import { PrometheusLens } from "../main/prometheus/lens";
import { PrometheusHelm } from "../main/prometheus/helm";
import { PrometheusOperator } from "../main/prometheus/operator";
import { PrometheusProviderRegistry } from "../main/prometheus/provider-registry";
import logger from "../main/logger";

[PrometheusLens, PrometheusHelm, PrometheusOperator].forEach(providerClass => {
  const provider = new providerClass()
  logger.info(provider.id)
  PrometheusProviderRegistry.registerProvider(provider.id, provider)
});

export const prometheusProviders = PrometheusProviderRegistry.getProviders()