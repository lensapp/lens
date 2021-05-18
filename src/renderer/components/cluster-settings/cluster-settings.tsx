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

import React from "react";
import { ClusterStore } from "../../../common/cluster-store";
import { ClusterProxySetting } from "./components/cluster-proxy-setting";
import { ClusterNameSetting } from "./components/cluster-name-setting";
import { ClusterHomeDirSetting } from "./components/cluster-home-dir-setting";
import { ClusterAccessibleNamespaces } from "./components/cluster-accessible-namespaces";
import { ClusterMetricsSetting } from "./components/cluster-metrics-setting";
import { ShowMetricsSetting } from "./components/show-metrics";
import { ClusterPrometheusSetting } from "./components/cluster-prometheus-setting";
import { ClusterKubeconfig } from "./components/cluster-kubeconfig";
import { entitySettingRegistry } from "../../../extensions/registries";
import { CatalogEntity } from "../../api/catalog-entity";


function getClusterForEntity(entity: CatalogEntity) {
  return ClusterStore.getInstance().getById(entity.metadata.uid);
}

entitySettingRegistry.add([
  {
    apiVersions: ["entity.k8slens.dev/v1alpha1"],
    kind: "KubernetesCluster",
    source: "local",
    title: "General",
    components: {
      View: (props: { entity: CatalogEntity }) => {
        const cluster = getClusterForEntity(props.entity);

        if (!cluster) {
          return null;
        }

        return (
          <section>
            <section>
              <ClusterNameSetting cluster={cluster} />
            </section>
            <section>
              <ClusterKubeconfig cluster={cluster} />
            </section>
          </section>
        );
      }
    }
  },
  {
    apiVersions: ["entity.k8slens.dev/v1alpha1"],
    kind: "KubernetesCluster",
    title: "Proxy",
    components: {
      View: (props: { entity: CatalogEntity }) => {
        const cluster = getClusterForEntity(props.entity);

        if (!cluster) {
          return null;
        }

        return (
          <section>
            <ClusterProxySetting cluster={cluster} />
          </section>
        );
      }
    }
  },
  {
    apiVersions: ["entity.k8slens.dev/v1alpha1"],
    kind: "KubernetesCluster",
    title: "Terminal",
    components: {
      View: (props: { entity: CatalogEntity }) => {
        const cluster = getClusterForEntity(props.entity);

        if (!cluster) {
          return null;
        }

        return (
          <section>
            <ClusterHomeDirSetting cluster={cluster} />
          </section>
        );
      }
    }
  },
  {
    apiVersions: ["entity.k8slens.dev/v1alpha1"],
    kind: "KubernetesCluster",
    title: "Namespaces",
    components: {
      View: (props: { entity: CatalogEntity }) => {
        const cluster = getClusterForEntity(props.entity);

        if (!cluster) {
          return null;
        }

        return (
          <section>
            <ClusterAccessibleNamespaces cluster={cluster} />
          </section>
        );
      }
    }
  },
  {
    apiVersions: ["entity.k8slens.dev/v1alpha1"],
    kind: "KubernetesCluster",
    title: "Metrics",
    components: {
      View: (props: { entity: CatalogEntity }) => {
        const cluster = getClusterForEntity(props.entity);

        if (!cluster) {
          return null;
        }

        return (
          <section>
            <section>
              <ClusterPrometheusSetting cluster={cluster} />
            </section>
            <section>
              <ClusterMetricsSetting cluster={cluster}/>
            </section>
            <section>
              <ShowMetricsSetting cluster={cluster}/>
            </section>
          </section>
        );
      }
    }
  }
]);
