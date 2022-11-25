/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterContextHandler } from "../context-handler/context-handler";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { PrometheusProvider } from "../prometheus/provider";
import { prometheusProviderInjectionToken } from "../prometheus/provider";
import { runInAction } from "mobx";

enum ServiceResult {
  Success,
  Failure,
}

const createTestPrometheusProvider = (kind: string, alwaysFail: ServiceResult): PrometheusProvider => ({
  kind,
  name: "TestProvider1",
  isConfigurable: false,
  getQuery: () => {
    throw new Error("getQuery is not implemented.");
  },
  getPrometheusService: async () => {
    switch (alwaysFail) {
      case ServiceResult.Success:
        return {
          kind,
          namespace: "default",
          port: 7000,
          service: "",
        };
      case ServiceResult.Failure:
        throw new Error("does fail");
    }
  },
});

const clusterStub = {
  getProxyKubeconfig: () => ({
    makeApiClient: (): void => undefined,
  }),
  apiUrl: "http://localhost:81",
} as unknown as Cluster;

describe("ContextHandler", () => {
  let createContextHandler: (cluster: Cluster) => ClusterContextHandler;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    di.override(createKubeAuthProxyInjectable, () => ({} as any));

    createContextHandler = di.inject(createContextHandlerInjectable);
  });

  describe("getPrometheusService", () => {
    it.each([
      [0],
      [1],
      [2],
      [3],
    ])("should throw after %d failure(s)", async (failures) => {
      runInAction(() => {
        for (let i = 0; i < failures; i += 1) {
          di.register(getInjectable({
            id: `test-prometheus-provider-failure-${i}`,
            injectionToken: prometheusProviderInjectionToken,
            instantiate: () => createTestPrometheusProvider(`id_failure_${i}`, ServiceResult.Failure),
          }));
        }
      });

      expect(() => createContextHandler(clusterStub).getPrometheusDetails()).rejects.toThrowError();
    });

    it.each([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ])("should pick the first provider of %d success(es) after %d failure(s)", async (successes, failures) => {
      runInAction(() => {
        for (let i = 0; i < failures; i += 1) {
          di.register(getInjectable({
            id: `test-prometheus-provider-failure-${i}`,
            injectionToken: prometheusProviderInjectionToken,
            instantiate: () => createTestPrometheusProvider(`id_failure_${i}`, ServiceResult.Failure),
          }));
        }

        for (let i = 0; i < successes; i += 1) {
          di.register(getInjectable({
            id: `test-prometheus-provider-success-${i}`,
            injectionToken: prometheusProviderInjectionToken,
            instantiate: () => createTestPrometheusProvider(`id_success_${i}`, ServiceResult.Success),
          }));
        }
      });

      const details = await createContextHandler(clusterStub).getPrometheusDetails();

      expect(details.provider.kind === `id_failure_${failures}`);
    });

    it.each([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ])("should pick the first provider of %d success(es) before %d failure(s)", async (successes, failures) => {
      runInAction(() => {
        for (let i = 0; i < failures; i += 1) {
          di.register(getInjectable({
            id: `test-prometheus-provider-failure-${i}`,
            injectionToken: prometheusProviderInjectionToken,
            instantiate: () => createTestPrometheusProvider(`id_failure_${i}`, ServiceResult.Failure),
          }));
        }

        for (let i = 0; i < successes; i += 1) {
          di.register(getInjectable({
            id: `test-prometheus-provider-success-${i}`,
            injectionToken: prometheusProviderInjectionToken,
            instantiate: () => createTestPrometheusProvider(`id_success_${i}`, ServiceResult.Success),
          }));
        }
      });

      const details = await createContextHandler(clusterStub).getPrometheusDetails();

      expect(details.provider.kind === "id_failure_0");
    });

    it.each([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ])("should pick the first provider of %d success(es) between %d failure(s)", async (successes, failures) => {
      const beforeSuccesses = Math.floor(successes / 2);

      runInAction(() => {
        for (let i = 0; i < beforeSuccesses; i += 1) {
          di.register(getInjectable({
            id: `test-prometheus-provider-success-${i}`,
            injectionToken: prometheusProviderInjectionToken,
            instantiate: () => createTestPrometheusProvider(`id_success_${i}`, ServiceResult.Success),
          }));
        }

        for (let i = 0; i < failures; i += 1) {
          di.register(getInjectable({
            id: `test-prometheus-provider-failure-${i}`,
            injectionToken: prometheusProviderInjectionToken,
            instantiate: () => createTestPrometheusProvider(`id_failure_${i}`, ServiceResult.Failure),
          }));
        }

        for (let i = beforeSuccesses; i < successes; i += 1) {
          di.register(getInjectable({
            id: `test-prometheus-provider-success-${i}`,
            injectionToken: prometheusProviderInjectionToken,
            instantiate: () => createTestPrometheusProvider(`id_success_${i}`, ServiceResult.Success),
          }));
        }
      });

      const details = await createContextHandler(clusterStub).getPrometheusDetails();

      expect(details.provider.kind === "id_success_0");
    });
  });
});
