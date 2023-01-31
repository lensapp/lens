import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DiContainer } from "@ogre-tools/injectable";
import React from "react";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import type { Fetch } from "../../../common/fetch/fetch.injectable";
import fetchInjectable from "../../../common/fetch/fetch.injectable";
import { Namespace } from "../../../common/k8s-api/endpoints";
import { createMockResponseFromString } from "../../../test-utils/mock-responses";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import createClusterInjectable from "../../cluster/create-cluster.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { type Disposer, disposer } from "../../utils";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { NamespaceTreeView } from "./namespace-tree-view";
import type { NamespaceStore } from "./store";
import namespaceStoreInjectable from "./store.injectable";

function createNamespace(name: string): Namespace {
  return new Namespace({
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
      name,
      resourceVersion: "1",
      selfLink: `/api/v1/namespaces/${name}`,
      uid: `${name}-1`,
    },
  });
}

describe("<NamespaceTreeView />", () => {
  let di: DiContainer;
  let render: DiRender;
  let namespaceStore: NamespaceStore;
  let fetchMock: AsyncFnMock<Fetch>;
  let cleanup: Disposer;
  
  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    di.unoverride(subscribeStoresInjectable);

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    const createCluster = di.inject(createClusterInjectable);

    di.override(hostedClusterInjectable, () => createCluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }, {
      clusterServerUrl: "https://localhost:8080",
    }));

    namespaceStore = di.inject(namespaceStoreInjectable);

    const subscribeStores = di.inject(subscribeStoresInjectable);

    cleanup = disposer(subscribeStores([namespaceStore]));
    render = renderFor(di);
  });

  afterEach(() => {
    cleanup();
  });

  describe("once the subscribe resolves", () => {
    beforeEach(async () => {
      await fetchMock.resolveSpecific([
        "https://127.0.0.1:12345/api-kube/api/v1/namespaces",
      ], createMockResponseFromString("https://127.0.0.1:12345/api-kube/api/v1/namespaces", JSON.stringify({
        apiVersion: "v1",
        kind: "NamespaceList",
        metadata: {},
        items: [
          createNamespace("test-1"),
          createNamespace("test-2"),
          createNamespace("test-3"),
          createNamespace("test-4"),
          createNamespace("test-5"),
          createNamespace("test-6"),
          createNamespace("test-7"),
          createNamespace("test-8"),
          createNamespace("test-9"),
          createNamespace("test-10"),
          createNamespace("test-11"),
          createNamespace("test-12"),
          createNamespace("test-13"),
        ],
      })));
    });

    it("renders null with regular namespace", () => {
      const result = render(<NamespaceTreeView root={createNamespace("tree-1")} />);
  
      expect(result.baseElement).toMatchSnapshot();
    });

    it("renders one namespace without children", () => {
      const ns = new Namespace({
        apiVersion: "v1",
        kind: "Namespace",
        metadata: {
          name: "acme-group",
          resourceVersion: "1",
          selfLink: `/api/v1/namespaces/acme-group`,
          uid: `acme-group-1`,
          labels: {
            "hnc.x-k8s.io/included-namespace": "true",
          }
        },
      });
      const result = render(<NamespaceTreeView root={ns} />);
  
      expect(result.baseElement).toMatchSnapshot();
    });
  });
});