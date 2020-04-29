import { PrometheusLens } from "./lens";
import { PrometheusHelm } from "./helm";
import { PrometheusOperator } from "./operator";
import { PrometheusProviderRegistry } from "./provider";


PrometheusProviderRegistry.registerProvider("lens", new PrometheusLens())
PrometheusProviderRegistry.registerProvider("helm", new PrometheusHelm())
PrometheusProviderRegistry.registerProvider("operator", new PrometheusOperator())