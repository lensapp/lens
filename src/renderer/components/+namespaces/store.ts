/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { makeObservable } from "mobx";
import { autoBind, noop } from "../../utils";
import { KubeObjectStore, KubeObjectStoreLoadingParams } from "../../../common/k8s-api/kube-object.store";
import { Namespace, NamespaceApi } from "../../../common/k8s-api/endpoints/namespace.api";

export class NamespaceStore extends KubeObjectStore<Namespace> {
  constructor(public readonly api:NamespaceApi) {
    super();
    makeObservable(this);
    autoBind(this);
  }

  subscribe() {
    /**
     * if user has given static list of namespaces let's not start watches
     * because watch adds stuff that's not wanted or will just fail
     */
    if (this.context?.cluster.accessibleNamespaces.length > 0) {
      return noop;
    }

    return super.subscribe();
  }

  protected loadItems(params: KubeObjectStoreLoadingParams): Promise<Namespace[]> {
    if (this.context?.cluster?.accessibleNamespaces.length > 0) {
      return Promise.resolve(this.context.cluster.accessibleNamespaces.map(getDummyNamespace));
    }

    return super.loadItems(params);
  }
}

export function getDummyNamespace(name: string) {
  return new Namespace({
    kind: Namespace.kind,
    apiVersion: "v1",
    metadata: {
      name,
      uid: "",
      resourceVersion: "",
      selfLink: `/api/v1/namespaces/${name}`,
    },
  });
}
