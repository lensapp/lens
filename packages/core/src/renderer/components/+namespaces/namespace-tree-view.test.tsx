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

function createNamespace(name: string, labels?: Record<string, string>, annotations?: Record<string, string>): Namespace {
  return new Namespace({
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
      name,
      resourceVersion: "1",
      selfLink: `/api/v1/namespaces/${name}`,
      uid: `${name}-1`,
      labels: {
        ...labels
      },
      annotations: {
        ...annotations
      }
    },
  });
}

const singleRoot = createNamespace("single-root", {
  "hnc.x-k8s.io/included-namespace": "true",
});

const acmeGroup = createNamespace("acme-org", {
  "hnc.x-k8s.io/included-namespace": "true",
});

const orgA = createNamespace("org-a", {
  "hnc.x-k8s.io/included-namespace": "true",
});

const teamA = createNamespace("team-a", {
  "hnc.x-k8s.io/included-namespace": "true",
  "acme-org.tree.hnc.x-k8s.io/depth": "1",
  "kubernetes.io/metadata.name": "team-a",
  "team-a.tree.hnc.x-k8s.io/depth": "0",
});

const teamB = createNamespace("team-b", {
  "hnc.x-k8s.io/included-namespace": "true",
  "acme-org.tree.hnc.x-k8s.io/depth": "1",
  "kubernetes.io/metadata.name": "team-b",
  "team-b.tree.hnc.x-k8s.io/depth": "0",
});

const teamC = createNamespace("team-c", {
  "hnc.x-k8s.io/included-namespace": "true",
  "org-a.tree.hnc.x-k8s.io/depth": "1",
  "kubernetes.io/metadata.name": "team-c",
  "team-c.tree.hnc.x-k8s.io/depth": "0",
});

const service1 = createNamespace("service-1", {
  "hnc.x-k8s.io/included-namespace": "true",
  "org-a.tree.hnc.x-k8s.io/depth": "1",
  "kubernetes.io/metadata.name": "team-c",
  "service-1.tree.hnc.x-k8s.io/depth": "0",
}, {
  "hnc.x-k8s.io/subnamespace-of": "org-a",
});

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
          acmeGroup,
          orgA,
          teamA,
          teamB,
          teamC,
          service1,
        ],
      })));
    });

    it("renders null with regular namespace", () => {
      const result = render(<NamespaceTreeView root={createNamespace("tree-1")} />);
  
      expect(result.baseElement).toMatchSnapshot();
    });

    it("renders one namespace without children", () => {
      const result = render(<NamespaceTreeView root={singleRoot} />);
  
      expect(result.baseElement).toMatchSnapshot();
    });

    it("renders namespace with 2 children namespaces", () => {
      const result = render(<NamespaceTreeView root={acmeGroup} />);

      expect(result.baseElement).toMatchSnapshot();
    });

    it("renders namespace with children namespaces and a subnamespace", () => {
      const result = render(<NamespaceTreeView root={orgA} />);

      expect(result.baseElement).toMatchSnapshot();
    });

    it("renders an indicator badge for the subnamespace", () => {
      const result = render(<NamespaceTreeView root={orgA} />);

      expect(result.getByTestId("subnamespace-badge-for-service-1-1")).toBeInTheDocument();
    });

    it("does not render an indicator badge for the true namespace", () => {
      const result = render(<NamespaceTreeView root={orgA} />);
      const trueNamespace = result.getByTestId("namespace-team-c-1");

      expect(trueNamespace.querySelector("[data-testid='subnamespace-badge-for-team-c-1']")).toBeNull();
    });
  });
});