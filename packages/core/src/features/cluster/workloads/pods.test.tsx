/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import navigateToPodsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/pods/navigate-to-pods.injectable";
import { type ApplicationBuilder, getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import podStoreInjectable from "../../../renderer/components/workloads-pods/store.injectable";
import type { PodMetrics, PodStatus } from "@k8slens/kube-object";
import { Pod } from "@k8slens/kube-object";
import type { PodMetricsApi } from "../../../common/k8s-api/endpoints/pod-metrics.api";
import podMetricsApiInjectable from "../../../common/k8s-api/endpoints/pod-metrics.api.injectable";
import type { RequestMetrics } from "../../../common/k8s-api/endpoints/metrics.api/request-metrics.injectable";
import requestMetricsInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-metrics.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";

describe("workloads / pods", () => {
  let rendered: RenderResult;
  let applicationBuilder: ApplicationBuilder;
  const podMetrics: PodMetrics[] = [];

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder().setEnvironmentToClusterFrame();
    applicationBuilder.namespaces.add("default");
    applicationBuilder.beforeWindowStart(({ windowDi }) => {
      applicationBuilder.allowKubeResource({
        apiName: "pods",
        group: "",
      });

      windowDi.override(podMetricsApiInjectable, () => ({
        list: async () => Promise.resolve(podMetrics),
      } as PodMetricsApi));

      const apiManager = windowDi.inject(apiManagerInjectable);
      const podStore = windowDi.inject(podStoreInjectable);

      apiManager.registerStore(podStore);
    });
  });

  describe("when navigating to workloads / pods view", () => {
    describe("given pods are loading", () => {
      beforeEach(async () => {
        applicationBuilder.afterWindowStart(({ windowDi }) => {
          const podStore = windowDi.inject(podStoreInjectable);

          podStore.items.clear();
          podStore.isLoaded = false;
          podStore.isLoading = true;
        });

        rendered = await applicationBuilder.render();
        applicationBuilder.navigateWith(navigateToPodsInjectable);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows loading spinner", async () => {
        expect(await rendered.findByTestId("kube-object-list-layout-spinner")).toBeInTheDocument();
      });
    });

    describe("given no pods", () => {
      beforeEach(async () => {
        applicationBuilder.afterWindowStart(({ windowDi }) => {
          const podStore = windowDi.inject(podStoreInjectable);

          podStore.items.clear();
          podStore.isLoaded = true;
        });

        rendered = await applicationBuilder.render();
        applicationBuilder.navigateWith(navigateToPodsInjectable);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows item list is empty", () => {
        expect(rendered.getByText("Item list is empty")).toBeInTheDocument();
      });
    });

    describe("given a namespace has pods", () => {
      beforeEach(async () => {
        applicationBuilder.afterWindowStart(({ windowDi }) => {
          windowDi.override(requestMetricsInjectable, () => (() => Promise.resolve({})) as unknown as RequestMetrics);

          const podStore = windowDi.inject(podStoreInjectable);

          podStore.items.push(new Pod({
            apiVersion: "v1",
            kind: "Pod",
            metadata: {
              name: "test-pod-1",
              namespace: "default",
              resourceVersion: "irrelevant",
              selfLink: "/api/v1/namespaces/default/pods/test-pod-1",
              uid: "uuid-1",
            },
            spec: {
              containers: [
                {
                  name: "container-1",
                },
                {
                  name: "container-2",
                },
              ],
            },
            status: {} as PodStatus,
          }));
          podStore.isLoaded = true;
        });

        rendered = await applicationBuilder.render();
        applicationBuilder.navigateWith(navigateToPodsInjectable);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("renders the pod list", async () => {
        expect(await rendered.findByTestId(`list-pod-name-uuid-1`)).toBeInTheDocument();
      });
    });
  });
});
