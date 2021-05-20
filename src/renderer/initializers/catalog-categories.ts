/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { clusterDisconnectHandler } from "../../common/cluster-ipc";
import { ClusterPreferencesStore } from "../../common/cluster-store";
import { requestMain } from "../../common/ipc";
import { CatalogCategoryRegistry, MenuContext, MenuEntry } from "../catalog";
import { KubernetesCluster } from "../catalog-entities";
import { productName } from "../../common/vars";
import { WebLink } from "../catalog-entities/web-link";

export function initCatalogCategoryHandlers() {
  const registry = CatalogCategoryRegistry.getInstance();

  /**
   * KubernetesCluster
   */
  registry.add({
    apiVersion: "catalog.k8slens.dev/v1alpha1",
    kind: "CatalogCategory",
    metadata: {
      name: "Kubernetes Clusters",
      icon: require(`!!raw-loader!./catalog-icons/kubernetes.svg`).default // eslint-disable-line
    },
    spec: {
      group: "entity.k8slens.dev",
      versions: [
        {
          version: "v1alpha1",
          entityConstructor: KubernetesCluster,
        }
      ],
      names: {
        kind: "KubernetesCluster"
      }
    }
  });
  registry.registerHandler(
    "entity.k8slens.dev/v1alpha1",
    "KubernetesCluster",
    "onCatalogAddMenu",
    (ctx: MenuContext) => [
      {
        icon: "text_snippet",
        title: "Add from kubeconfig",
        onClick: () => {
          ctx.navigate("/add-cluster");
        }
      }
    ]
  );
  registry.registerHandler(
    "entity.k8slens.dev/v1alpha1",
    "KubernetesCluster",
    "onContextMenuOpen",
    (entity: KubernetesCluster, ctx: MenuContext) => {
      const res: MenuEntry[] = [
        {
          title: "Settings",
          onlyVisibleForSource: "local",
          onClick: () => ctx.navigate(`/entity/${entity.metadata.uid}/settings`)
        }
      ];

      if (entity.metadata.labels["file"]?.startsWith(ClusterPreferencesStore.storedKubeConfigFolder)) {
        res.push({
          title: "Delete",
          onlyVisibleForSource: "local",
          onClick: () => ClusterPreferencesStore.getInstance().removeById(entity.metadata.uid),
          confirm: {
            message: `Remove Kubernetes Cluster "${entity.metadata.name} from ${productName}?`
          }
        });
      }

      if (entity.status.phase == "connected") {
        res.push({
          title: "Disconnect",
          onClick: () => {
            ClusterPreferencesStore.getInstance().deactivate(entity.metadata.uid);
            requestMain(clusterDisconnectHandler, entity.metadata.uid);
          }
        });
      } else {
        res.push({
          title: "Connect",
          onClick: () => {
            ctx.navigate(`/cluster/${entity.metadata.uid}`);
          }
        });
      }

      return res;
    }
  );

  /**
   * WebLink
   */
  registry.add({
    apiVersion: "catalog.k8slens.dev/v1alpha1",
    kind: "WebLink",
    metadata: {
      name: "Web Links",
      icon: "link"
    },
    spec: {
      group: "entity.k8slens.dev",
      versions: [
        {
          version: "v1alpha1",
          entityConstructor: WebLink,
        }
      ],
      names: {
        kind: "WebLink"
      }
    }
  });
}
