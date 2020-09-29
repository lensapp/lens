import { PrometheusLens } from "../main/prometheus/lens";
import { PrometheusHelm } from "../main/prometheus/helm";
import { PrometheusOperator } from "../main/prometheus/operator";
import { PrometheusDECC } from "../main/prometheus/decc";
import { PrometheusProviderRegistry } from "../main/prometheus/provider-registry";

[PrometheusLens, PrometheusHelm, PrometheusOperator, PrometheusDECC].forEach(providerClass => {
  const provider = new providerClass()
  PrometheusProviderRegistry.registerProvider(provider.id, provider)
});

export const prometheusProviders = PrometheusProviderRegistry.getProviders()