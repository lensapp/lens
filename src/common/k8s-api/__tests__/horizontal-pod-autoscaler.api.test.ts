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

describe("HorizontalPodAutoscalerApi", () => {
  describe("HPA v1", () => {
    it("should return correct empty metrics", () => {
      const hpa = new HorizontalPodAutoscaler(hpaV2);

      expect(hpa.getMetrics()).toHaveLength(0);
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

      expect(hpa.getMetricValues(hpa.getMetrics()[0])).toEqual("unknown / 50%");
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

      expect(hpa.getMetricValues(hpa.getMetrics()[0])).toEqual("unknown / 60%");
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

      expect(hpa.getMetricValues(hpa.getMetrics()[0])).toEqual("unknown / 1k");
    });
  });
});