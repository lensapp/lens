/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../getDiForUnitTesting";
import { Cluster } from "../../common/cluster/cluster";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { PrometheusProvider } from "@k8slens/prometheus";
import { prometheusProviderInjectionToken } from "@k8slens/prometheus";
import { runInAction } from "mobx";
import prometheusHandlerInjectable from "../cluster/prometheus-handler/prometheus-handler.injectable";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import lensProxyPortInjectable from "../lens-proxy/lens-proxy-port.injectable";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import writeJsonFileInjectable from "../../common/fs/write-json-file.injectable";

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

describe("PrometheusHandler", () => {
  let di: DiContainer;
  let cluster: Cluster;

  beforeEach(async () => {
    di = getDiForUnitTesting();
    di.override(createKubeAuthProxyInjectable, () => () => ({
      apiPrefix: "/some-api-prefix",
      exit: () => {},
      run: async () => {},
      port: 9191,
    }));
    di.override(directoryForTempInjectable, () => "/some-temp-dir");
    di.inject(lensProxyPortInjectable).set(12345);

    const writeJsonFile = di.inject(writeJsonFileInjectable);
    const kubeConfigPath = "/some/path-to-a-config";
    const contextName = "some-context-name";

    await writeJsonFile(kubeConfigPath, {
      apiVersion: "v1",
      kind: "Config",
      clusters: [{
        name: "some-cluster-name",
        cluster: {
          server: "https://localhost:8989",
        },
      }],
      users: [{
        name: "some-user-name",
      }],
      contexts: [{
        name: contextName,
        context: {
          user: "some-user-name",
          cluster: "some-cluster-name",
        },
      }],
    });

    cluster = new Cluster({
      contextName,
      id: "some-cluster-id",
      kubeConfigPath,
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
