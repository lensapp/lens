import { catalogCategoryRegistry } from "../catalog/catalog-category-registry";
import { CatalogEntity, CatalogEntityActionContext, CatalogEntityAddMenuContext, CatalogEntityContextMenuContext, CatalogEntityMetadata, CatalogEntityStatus } from "../catalog";
import { clusterDisconnectHandler } from "../cluster-ipc";
import { ClusterStore } from "../cluster-store";
import { requestMain } from "../ipc";
import { productName } from "../vars";
import { CatalogCategory, CatalogCategorySpec } from "../catalog";

export type KubernetesClusterSpec = {
  kubeconfigPath: string;
  kubeconfigContext: string;
};

export interface KubernetesClusterStatus extends CatalogEntityStatus {
  phase: "connected" | "disconnected";
}

export class KubernetesCluster extends CatalogEntity<CatalogEntityMetadata, KubernetesClusterStatus, KubernetesClusterSpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "KubernetesCluster";

  async onRun(context: CatalogEntityActionContext) {
    context.navigate(`/cluster/${this.metadata.uid}`);
  }

  onDetailsOpen(): void {
    //
  }

  onSettingsOpen(): void {
    //
  }

  async onContextMenuOpen(context: CatalogEntityContextMenuContext) {
    context.menuItems = [
      {
        icon: "settings",
        title: "Settings",
        onlyVisibleForSource: "local",
        onClick: async () => context.navigate(`/entity/${this.metadata.uid}/settings`)
      },
    ];

    if (this.metadata.labels["file"]?.startsWith(ClusterStore.storedKubeConfigFolder)) {
      context.menuItems.push({
        icon: "delete",
        title: "Delete",
        onlyVisibleForSource: "local",
        onClick: async () => ClusterStore.getInstance().removeById(this.metadata.uid),
        confirm: {
          message: `Remove Kubernetes Cluster "${this.metadata.name} from ${productName}?`
        }
      });
    }

    if (this.status.phase == "connected") {
      context.menuItems.unshift({
        icon: "link_off",
        title: "Disconnect",
        onClick: async () => {
          ClusterStore.getInstance().deactivate(this.metadata.uid);
          requestMain(clusterDisconnectHandler, this.metadata.uid);
        }
      });
    }

    const category = catalogCategoryRegistry.getCategoryForEntity<KubernetesClusterCategory>(this);

    if (category) category.emit("contextMenuOpen", this, context);
  }
}

export class KubernetesClusterCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Kubernetes Clusters",
    icon: require(`!!raw-loader!./icons/kubernetes.svg`).default // eslint-disable-line
  };
  public spec: CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: KubernetesCluster
      }
    ],
    names: {
      kind: "KubernetesCluster"
    }
  };

  constructor() {
    super();

    this.on("onCatalogAddMenu", (ctx: CatalogEntityAddMenuContext) => {
      ctx.menuItems.push({
        icon: "text_snippet",
        title: "Add from kubeconfig",
        onClick: () => {
          ctx.navigate("/add-cluster");
        }
      });
    });
  }
}

catalogCategoryRegistry.add(new KubernetesClusterCategory());
