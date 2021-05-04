import { CatalogCategoryRegistry } from "./catalog";
import { KubernetesCluster, WebLink } from "./catalog-entities";

export function registerDefaultCategories() {
  const registry = CatalogCategoryRegistry.getInstance();

  registry.add({
    apiVersion: "catalog.k8slens.dev/v1alpha1",
    kind: "CatalogCategory",
    metadata: {
      name: "Kubernetes Clusters",
      icon: require(`!!raw-loader!./icons/kubernetes.svg`).default // eslint-disable-line
    },
    spec: {
      group: "entity.k8slens.dev",
      versions: [
        {
          version: "v1alpha1",
          entityClass: KubernetesCluster
        }
      ],
      names: {
        kind: "KubernetesCluster"
      }
    },
    onAddMenuOpen: ({ navigate }) => [{
      icon: "text_snippet",
      title: "Add from kubeconfig",
      onClick: () => navigate("/add-cluster"),
    }],
  });
  registry.add({
    apiVersion: "catalog.k8slens.dev/v1alpha1",
    kind: "CatalogCategory",
    metadata: {
      name: "Web Links",
      icon: "link"
    },
    spec: {
      group: "entity.k8slens.dev",
      versions: [
        {
          version: "v1alpha1",
          entityClass: WebLink,
        }
      ],
      names: {
        kind: "WebLink",
      },
    },
  });
}
