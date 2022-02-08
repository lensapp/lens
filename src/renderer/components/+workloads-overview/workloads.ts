/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed } from "mobx";
import type { KubeResource } from "../../../common/rbac";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { workloadURL } from "../../../common/routes";
import { ResourceNames } from "../../utils/rbac";
import type { NamespaceStore } from "../+namespaces/namespace-store/namespace.store";
import type { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";

interface Dependencies {
  workloadStores: Map<KubeResource, KubeObjectStore<KubeObject>>;
  isAllowedResource: IsAllowedResource;
  namespaceStore: NamespaceStore;
}

export const workloads = ({
  workloadStores,
  isAllowedResource,
  namespaceStore,
}: Dependencies) =>
  computed(() =>
    [...workloadStores.entries()]
      .filter(([resource]) => isAllowedResource(resource))
      .map(([resource, store]) => {
        const items = store.getAllByNs(namespaceStore.contextNamespaces);

        return {
          resource,
          href: workloadURL[resource](),
          amountOfItems: items.length,
          status: store.getStatuses(items),
          title: ResourceNames[resource],
        };
      }),
  );
