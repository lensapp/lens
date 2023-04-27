/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { noop } from "@k8slens/utilities";
import type { KubeApi } from "../kube-api";
import { KubeObject } from "@k8slens/kube-object";
import type { KubeObjectStoreLoadingParams } from "../kube-object.store";
import { KubeObjectStore } from "../kube-object.store";

class FakeKubeObjectStore extends KubeObjectStore<KubeObject> {
  constructor(private readonly _loadItems: (params: KubeObjectStoreLoadingParams) => KubeObject[], api: Partial<KubeApi<KubeObject>>) {
    super({
      context: {
        allNamespaces: [],
        contextNamespaces: [],
        hasSelectedAll: false,
        isGlobalWatchEnabled: () => true,
        isLoadingAll: () => true,
      },
      logger: {
        debug: noop,
        error: noop,
        info: noop,
        silly: noop,
        warn: noop,
      },
    }, api as KubeApi<KubeObject>);
  }

  async loadItems(params: KubeObjectStoreLoadingParams) {
    return Promise.resolve(this._loadItems(params));
  }
}

describe("KubeObjectStore", () => {
  it("should remove an object from the list of items after it is not returned from listing the same namespace again", async () => {
    const loadItems = jest.fn();
    const obj = new KubeObject({
      apiVersion: "v1",
      kind: "Foo",
      metadata: {
        name: "some-obj-name",
        resourceVersion: "1",
        uid: "some-uid",
        namespace: "default",
        selfLink: "/some/self/link",
      },
    });
    const store = new FakeKubeObjectStore(loadItems, {
      isNamespaced: true,
    });

    loadItems.mockImplementationOnce(() => [obj]);

    await store.loadAll({
      namespaces: ["default"],
    });

    expect(store.items).toContain(obj);

    loadItems.mockImplementationOnce(() => []);

    await store.loadAll({
      namespaces: ["default"],
    });

    expect(store.items).not.toContain(obj);
  });

  it("should not remove an object that is not returned, if it is in a different namespace", async () => {
    const loadItems = jest.fn();
    const objInDefaultNamespace = new KubeObject({
      apiVersion: "v1",
      kind: "Foo",
      metadata: {
        name: "some-obj-name",
        resourceVersion: "1",
        uid: "some-uid",
        namespace: "default",
        selfLink: "/some/self/link",
      },
    });
    const objNotInDefaultNamespace = new KubeObject({
      apiVersion: "v1",
      kind: "Foo",
      metadata: {
        name: "some-obj-name",
        resourceVersion: "1",
        uid: "some-uid",
        namespace: "not-default",
        selfLink: "/some/self/link",
      },
    });
    const store = new FakeKubeObjectStore(loadItems, {
      isNamespaced: true,
    });

    loadItems.mockImplementationOnce(() => [objInDefaultNamespace]);

    await store.loadAll({
      namespaces: ["default"],
    });

    expect(store.items).toContain(objInDefaultNamespace);

    loadItems.mockImplementationOnce(() => [objNotInDefaultNamespace]);

    await store.loadAll({
      namespaces: ["not-default"],
    });

    expect(store.items).toContain(objInDefaultNamespace);
  });

  it("should remove all objects not returned if the api is cluster-scoped", async () => {
    const loadItems = jest.fn();
    const clusterScopedObject1 = new KubeObject({
      apiVersion: "v1",
      kind: "Foo",
      metadata: {
        name: "some-obj-name",
        resourceVersion: "1",
        uid: "some-uid",
        selfLink: "/some/self/link",
      },
    });
    const clusterScopedObject2 = new KubeObject({
      apiVersion: "v1",
      kind: "Foo",
      metadata: {
        name: "some-obj-name",
        resourceVersion: "1",
        uid: "some-uid",
        namespace: "not-default",
        selfLink: "/some/self/link",
      },
    });
    const store = new FakeKubeObjectStore(loadItems, {
      isNamespaced: false,
    });

    loadItems.mockImplementationOnce(() => [clusterScopedObject1]);

    await store.loadAll({});

    expect(store.items).toContain(clusterScopedObject1);

    loadItems.mockImplementationOnce(() => [clusterScopedObject2]);

    await store.loadAll({});

    expect(store.items).not.toContain(clusterScopedObject1);
  });
});
