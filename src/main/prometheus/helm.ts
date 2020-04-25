import { PrometheusLens } from "./lens"

export class PrometheusHelm extends PrometheusLens {
  constructor() {
    super()
    this.rateAccuracy = "5m"
  }
}