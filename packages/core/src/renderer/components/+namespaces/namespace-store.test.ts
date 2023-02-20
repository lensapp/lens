/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DiContainer } from "@ogre-tools/injectable";
import { observable } from "mobx";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import type { Fetch } from "../../../common/fetch/fetch.injectable";
import fetchInjectable from "../../../common/fetch/fetch.injectable";
import { Namespace, NamespaceApi } from "../../../common/k8s-api/endpoints";
import type { DeleteResourceDescriptor } from "../../../common/k8s-api/kube-api";
import type { KubeJsonApiData } from "../../../common/k8s-api/kube-json-api";
import type { KubeJsonApiObjectMetadata, KubeObjectScope } from "../../../common/k8s-api/kube-object";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import createClusterInjectable from "../../cluster/create-cluster.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import removeSubnamespaceInjectable from "./remove-subnamespace.injectable";
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
      uid: `${name}`,
      labels: {
        ...labels,
      },
      annotations: {
        ...annotations,
      },
    },
  });
}

const fullNamespace = createNamespace("full-namespace");

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

const levelsDeep = createNamespace("levels-deep", {
  "hnc.x-k8s.io/included-namespace": "true",
});

const levelDeepChildA = createNamespace("level-deep-child-a", {
  "hnc.x-k8s.io/included-namespace": "true",
  "levels-deep.tree.hnc.x-k8s.io/depth": "1",
  "level-deep-child-a.tree.hnc.x-k8s.io/depth": "0",
});

const levelDeepChildB = createNamespace("level-deep-child-b", {
  "hnc.x-k8s.io/included-namespace": "true",
  "levels-deep.tree.hnc.x-k8s.io/depth": "1",
  "level-deep-child-b.tree.hnc.x-k8s.io/depth": "0",
});

const levelDeepSubChildA = createNamespace("level-deep-subchild-a", {
  "hnc.x-k8s.io/included-namespace": "true",
  "levels-deep.tree.hnc.x-k8s.io/depth": "2",
  "level-deep-child-b.tree.hnc.x-k8s.io/depth": "1",
  "level-deep-subchild-a.tree.hnc.x-k8s.io/depth": "0",
});

describe("NamespaceStore", () => {
  let di: DiContainer;
  let namespaceStore: NamespaceStore;
  let fetchMock: AsyncFnMock<Fetch>;
  let deleteNamespaceMock: jest.SpyInstance<Promise<KubeJsonApiData<KubeJsonApiObjectMetadata<KubeObjectScope>, unknown, unknown>>, [DeleteResourceDescriptor]>;
  let removeSubnamespaceMock: jest.Mock<any, any>;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);
    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    di.override(removeSubnamespaceInjectable, () => removeSubnamespaceMock);

    deleteNamespaceMock = jest.spyOn(NamespaceApi.prototype, "delete").mockImplementation();
    removeSubnamespaceMock = jest.fn();

    const createCluster = di.inject(createClusterInjectable);

    di.override(hostedClusterInjectable, () => createCluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }, {
      clusterServerUrl: "https://localhost:8080",
    }));

    namespaceStore = di.inject(namespaceStoreInjectable);

    namespaceStore.items = observable.array([
      fullNamespace,
      acmeGroup,
      orgA,
      teamA,
      teamB,
      teamC,
      service1,
      levelsDeep,
      levelDeepChildA,
      levelDeepChildB,
      levelDeepSubChildA,
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns tree for single node", () => {
    const tree = namespaceStore.getNamespaceTree(service1);

    expect(tree).toEqual({
      id: "service-1",
      namespace: service1,
      children: [],
    });
  });

  it("returns tree for namespace not listed in store", () => {
    const tree = namespaceStore.getNamespaceTree(singleRoot);

    expect(tree).toEqual({
      id: "single-root",
      namespace: singleRoot,
      children: [],
    });
  });

  it("return tree for namespace with children", () => {
    const tree = namespaceStore.getNamespaceTree(acmeGroup);

    expect(tree).toEqual({
      id: "acme-org",
      namespace: acmeGroup,
      children: [
        {
          id: "team-a",
          namespace: teamA,
          children: [],
        },
        {
          id: "team-b",
          namespace: teamB,
          children: [],
        },
      ],
    });
  });

  it("return tree for namespace with deep nested children", () => {
    const tree = namespaceStore.getNamespaceTree(levelsDeep);

    expect(tree).toEqual({
      id: "levels-deep",
      namespace: levelsDeep,
      children: [
        {
          id: "level-deep-child-a",
          namespace: levelDeepChildA,
          children: [],
        },
        {
          id: "level-deep-child-b",
          namespace: levelDeepChildB,
          children: [{
            id: "level-deep-subchild-a",
            namespace: levelDeepSubChildA,
            children: [],
          }],
        },
      ],
    });
  });

  describe("when removing a full namespace", () => {
    it("removes namespace", () => {
      namespaceStore.remove(fullNamespace);

      expect(deleteNamespaceMock).toBeCalledWith({ name: "full-namespace", namespace: undefined });
    });
  });

  describe("when removing a subnamespace", () => {
    it("does not remove namespace directly", () => {
      namespaceStore.remove(service1);

      expect(deleteNamespaceMock).not.toBeCalled();
    });

    it("calls remove subnamespace function", () => {
      namespaceStore.remove(service1);

      expect(removeSubnamespaceMock).toBeCalledWith("service-1");
    });
  });
});
