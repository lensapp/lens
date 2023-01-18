import type { DiContainer } from "@ogre-tools/injectable";
import getHorizontalPodAutoscalerMetrics from "../../../renderer/components/+config-autoscalers/get-hpa-metrics.injectable";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import { HorizontalPodAutoscaler, HpaMetricType } from "../endpoints";

const hpaV2 = {
  apiVersion: "autoscaling/v2",
  kind: "HorizontalPodAutoscaler",
  metadata: {
    name: "hpav2",
    resourceVersion: "1",
    uid: "hpav2",
    namespace: "default",
    selfLink: "/apis/autoscaling/v2/namespaces/default/horizontalpodautoscalers/hpav2",
  },
  spec: {
    maxReplicas: 10,
    scaleTargetRef: {
      kind: "Deployment",
      name: "hpav2deployment",
      apiVersion: "apps/v1",
    }
  }
}

describe("getHorizontalPodAutoscalerMetrics", () => {
  let di: DiContainer;
  let getMetrics: (hpa: HorizontalPodAutoscaler) => string[];

  beforeEach(() => {
    di = getDiForUnitTesting();

    getMetrics = di.inject(getHorizontalPodAutoscalerMetrics);
  });

  describe("HPA v2", () => {
    it("should return correct empty metrics", () => {
      const hpa = new HorizontalPodAutoscaler(hpaV2);

      expect(getMetrics(hpa)).toHaveLength(0);
    });

    it("should return correct resource metrics", () => {
      const hpa = new HorizontalPodAutoscaler({
        ...hpaV2,
        spec: {
          ...hpaV2.spec,
          metrics: [
            {
              type: HpaMetricType.Resource,
              resource: {
                name: "cpu",
                target: {
                  type: "Utilization",
                  averageUtilization: 50
                }
              }
            }
          ]
        }
      });

      expect(getMetrics(hpa)[0]).toEqual("unknown / 50%");
    });

    it("should return correct resource metrics with current metrics", () => {
      const hpa = new HorizontalPodAutoscaler({
        ...hpaV2,
        spec: {
          ...hpaV2.spec,
          metrics: [
            {
              type: HpaMetricType.Resource,
              resource: {
                name: "cpu",
                target: {
                  type: "Utilization",
                  averageUtilization: 50
                }
              }
            }
          ]
        },
        status: {
          currentReplicas: 1,
          desiredReplicas: 10,
          currentMetrics: [
            {
              type: HpaMetricType.Resource,
              resource: {
                name: "cpu",
                current: {
                  averageValue: "100m",
                  averageUtilization: 10
                }
              }
            }
          ],
        }
      });

      expect(getMetrics(hpa)[0]).toEqual("10% / 50%");
    });

    it("should return correct container resource metrics", () => {
      const hpa = new HorizontalPodAutoscaler(
        {
          ...hpaV2,
          spec: {
            ...hpaV2.spec,
            metrics: [
              {
                type: HpaMetricType.ContainerResource,
                containerResource: {
                  name: "cpu",
                  container: "nginx",
                  target: {
                    type: "Utilization",
                    averageUtilization: 60
                  }
                }
              }
            ]
          }
        }
      );

      expect(getMetrics(hpa)[0]).toEqual("unknown / 60%");
    });

    it("should return correct pod metrics", () => {
      const hpa = new HorizontalPodAutoscaler(
        {
          ...hpaV2,
          spec: {
            ...hpaV2.spec,
            metrics: [
              {
                type: HpaMetricType.Pods,
                pods: {
                  metric: {
                    name: "packets-per-second"
                  },
                  target: {
                    type: "AverageValue",
                    averageValue: "1k"
                  }
                }
              }
            ]
          }
        }
      );

      expect(getMetrics(hpa)[0]).toEqual("unknown / 1k");
    });

    it("should return correct object metrics", () => {
      const hpa = new HorizontalPodAutoscaler(
        {
          ...hpaV2,
          spec: {
            ...hpaV2.spec,
            metrics: [
              {
                type: HpaMetricType.Object,
                object: {
                  metric: {
                    name: "requests-per-second"
                  },
                  target: {
                    type: "Value",
                    value: "10k"
                  }
                }
              }
            ]
          }
        }
      );

      expect(getMetrics(hpa)[0]).toEqual("unknown / 10k");
    });

    it("should return correct external metrics with average value", () => {
      const hpa = new HorizontalPodAutoscaler(
        {
          ...hpaV2,
          spec: {
            ...hpaV2.spec,
            metrics: [
              {
                type: HpaMetricType.External,
                external: {
                  metric: {
                    name: "queue_messages_ready",
                    selector: {
                      matchLabels: {queue: 'worker_tasks'}
                    }
                  },
                  target: {
                    type: "AverageValue",
                    averageValue: "30"
                  }
                }
              }
            ]
          }
        }
      );

      expect(getMetrics(hpa)[0]).toEqual("unknown / 30 (avg)");
    });

    it("should return correct external metrics with value", () => {
      const hpa = new HorizontalPodAutoscaler(
        {
          ...hpaV2,
          spec: {
            ...hpaV2.spec,
            metrics: [
              {
                type: HpaMetricType.External,
                external: {
                  metric: {
                    name: "queue_messages_ready",
                    selector: {
                      matchLabels: {queue: 'worker_tasks'}
                    }
                  },
                  target: {
                    type: "Value",
                    value: "30"
                  }
                }
              }
            ]
          }
        }
      );

      expect(getMetrics(hpa)[0]).toEqual("unknown / 30");
    });
  });
});