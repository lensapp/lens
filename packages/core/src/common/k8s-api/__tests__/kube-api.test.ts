/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { KubeApi, PodApi } from "@k8slens/kube-api";
import { Pod } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import type { Fetch } from "../../fetch/fetch.injectable";
import fetchInjectable from "../../fetch/fetch.injectable";
import type { CreateKubeApiForRemoteCluster } from "../create-kube-api-for-remote-cluster.injectable";
import createKubeApiForRemoteClusterInjectable from "../create-kube-api-for-remote-cluster.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { flushPromises } from "@k8slens/test-utils";
import createKubeJsonApiInjectable from "../create-kube-json-api.injectable";
import type { KubeStatusData } from "@k8slens/kube-object";
import setupAutoRegistrationInjectable from "../../../renderer/before-frame-starts/runnables/setup-auto-registration.injectable";
import { createMockResponseFromString } from "../../../test-utils/mock-responses";
import storesAndApisCanBeCreatedInjectable from "../../../renderer/stores-apis-can-be-created.injectable";
import directoryForUserDataInjectable from "../../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import hostedClusterInjectable from "../../../renderer/cluster-frame-context/hosted-cluster.injectable";
import directoryForKubeConfigsInjectable from "../../app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import apiKubeInjectable from "../../../renderer/k8s/api-kube.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { podApiInjectable } from "@k8slens/kube-api-specifics";

// NOTE: this is fine because we are testing something that only exported
// eslint-disable-next-line no-restricted-imports
import { PodsApi } from "../../../extensions/common-api/k8s-api";
import { Cluster } from "../../cluster/cluster";

describe("createKubeApiForRemoteCluster", () => {
  let createKubeApiForRemoteCluster: CreateKubeApiForRemoteCluster;
  let fetchMock: AsyncFnMock<Fetch>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    createKubeApiForRemoteCluster = di.inject(createKubeApiForRemoteClusterInjectable);
  });

  it("builds api client for KubeObject", () => {
    const api = createKubeApiForRemoteCluster({
      cluster: {
        server: "https://127.0.0.1:6443",
      },
      user: {
        token: "daa",
      },
    }, Pod);

    expect(api).toBeInstanceOf(KubeApi);
  });

  describe("when building for remote cluster with specific constructor", () => {
    let api: PodApi;

    beforeEach(() => {
      api = createKubeApiForRemoteCluster({
        cluster: {
          server: "https://127.0.0.1:6443",
        },
        user: {
          token: "daa",
        },
      }, Pod, PodsApi);
    });

    it("uses the constructor", () => {
      expect(api).toBeInstanceOf(PodApi);
    });

    describe("when calling list without namespace", () => {
      let listRequest: Promise<Pod[] | null>;

      beforeEach(async () => {
        listRequest = api.list();

        // This is required because of how JS promises work
        await flushPromises();
      });

      it("should request pods from default namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "https://127.0.0.1:6443/api/v1/pods",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["https://127.0.0.1:6443/api/v1/pods"],
            createMockResponseFromString("https://127.0.0.1:6443/api/v1/pods", JSON.stringify({
              kind: "PodList",
              apiVersion: "v1",
              metadata:{
                resourceVersion: "452899",
              },
              items: [],
            })),
          );
        });

        it("resolves the list call", async () => {
          expect(await listRequest).toEqual([]);
        });
      });
    });
  });
});

describe("KubeApi", () => {
  let fetchMock: AsyncFnMock<Fetch>;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));

    di.override(apiKubeInjectable, () => createKubeJsonApi({
      serverAddress: `http://127.0.0.1:9999`,
      apiBase: "/api-kube",
    }));

    const setupAutoRegistration = di.inject(setupAutoRegistrationInjectable);

    setupAutoRegistration.run();
  });

  describe("deleting pods (namespace scoped resource)", () => {
    let api: PodApi;

    beforeEach(() => {
      api = di.inject(podApiInjectable);
    });

    describe("eviction-api as better replacement for pod.delete() request", () => {
      let evictRequest: Promise<string>;

      beforeEach(() => {
        evictRequest = api.evict({ name: "foo", namespace: "test" });
      });

      it("requests evicting a pod in given namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "post",
          },
        ]);
      });

      it("should resolve the call with >=200 <300 http code", async () => {
        void fetchMock.resolveSpecific(
          ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction"],
          createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction", JSON.stringify({
            apiVersion: "policy/v1",
            kind: "Status",
            code: 201,
            status: "all good",
          } as KubeStatusData)),
        );

        expect(await evictRequest).toBe("201: all good");
      });

      it("should throw in case of error", async () => {
        void fetchMock.resolveSpecific(
          ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction"],
          createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction", JSON.stringify({
            apiVersion: "policy/v1",
            kind: "Status",
            code: 500,
            status: "something went wrong",
          } as KubeStatusData)),
        );

        await expect(async () => evictRequest).rejects.toBe("500: something went wrong");
      });
    });
  });
});
