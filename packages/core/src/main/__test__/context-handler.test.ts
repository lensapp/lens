/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../getDiForUnitTesting";
import { Cluster } from "../../common/cluster/cluster";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { PrometheusProvider } from "../prometheus/provider";
import { prometheusProviderInjectionToken } from "../prometheus/provider";
import { runInAction } from "mobx";
import prometheusHandlerInjectable from "../cluster/prometheus-handler/prometheus-handler.injectable";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import lensProxyPortInjectable from "../lens-proxy/lens-proxy-port.injectable";
import type { KubeAuthProxy } from "../kube-auth-proxy/kube-auth-proxy";
import loadProxyKubeconfigInjectable from "../cluster/load-proxy-kubeconfig.injectable";
import type { KubeConfig } from "@kubernetes/client-node";

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

describe("ContextHandler", () => {
  let di: DiContainer;
  let cluster: Cluster;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.override(loadProxyKubeconfigInjectable, () => async () => ({
      makeApiClient: () => ({} as any),
    } as Partial<KubeConfig>));

    di.override(createKubeAuthProxyInjectable, () => () => ({
      run: async () => {},
    } as KubeAuthProxy));
    di.override(directoryForTempInjectable, () => "/some-directory-for-tmp");
    di.inject(lensProxyPortInjectable).set(9968);

    cluster = new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-kubeconfig-path",
    }, {
      clusterServerUrl: "https://some-website.com",
    });
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

      expect(() => di.inject(prometheusHandlerInjectable, cluster).getPrometheusDetails()).rejects.toThrowError();
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

      const details = await di.inject(prometheusHandlerInjectable, cluster).getPrometheusDetails();

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

      const details = await di.inject(prometheusHandlerInjectable, cluster).getPrometheusDetails();

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

      const details = await di.inject(prometheusHandlerInjectable, cluster).getPrometheusDetails();

      expect(details.provider.kind === "id_success_0");
    });
  });
});
