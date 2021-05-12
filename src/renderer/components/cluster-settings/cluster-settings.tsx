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
    group: "Settings",
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
    group: "Settings",
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
    group: "Settings",
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
    group: "Settings",
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
    group: "Settings",
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
