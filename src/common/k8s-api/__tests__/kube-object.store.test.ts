/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { when } from "mobx";
import { KubeObject } from "../kube-object";
import type { KubeObjectStoreLoadingParams } from "../kube-object.store";
import { KubeObjectStore } from "../kube-object.store";

class FakeKubeObjectStore extends KubeObjectStore<KubeObject> {
  get contextReady() {
    return when(() => true);
  }

  constructor(private readonly _loadItems: (params: KubeObjectStoreLoadingParams) => KubeObject[]) {
    super();
  }

  async loadItems(params: KubeObjectStoreLoadingParams) {
    return this._loadItems(params);
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
      },
    });
    const store = new FakeKubeObjectStore(loadItems);

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
});
