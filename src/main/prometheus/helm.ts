import { PrometheusLens } from "./lens"

export class PrometheusHelm extends PrometheusLens {
  constructor() {
    super()
    this.id = "helm"
    this.name = "Helm"
    this.rateAccuracy = "5m"
  }
}