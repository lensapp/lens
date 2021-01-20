import { PrometheusLens } from "../main/prometheus/lens";
import { PrometheusHelm } from "../main/prometheus/helm";
import { PrometheusOperator } from "../main/prometheus/operator";
import { PrometheusStacklight } from "../main/prometheus/stacklight";
import { PrometheusProviderRegistry } from "../main/prometheus/provider-registry";

[PrometheusLens, PrometheusHelm, PrometheusOperator, PrometheusStacklight].forEach(providerClass => {
  const provider = new providerClass();

  PrometheusProviderRegistry.registerProvider(provider.id, provider);
});

export const prometheusProviders = PrometheusProviderRegistry.getProviders();
