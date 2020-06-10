import { app } from "electron"
import { CoreV1Api } from "@kubernetes/client-node"
import { LensApiRequest } from "../router"
import { LensApi } from "../lens-api"
import { userStore } from "../../common/user-store"
import { Cluster } from "../cluster"

export interface IConfigRoutePayload {
  kubeVersion?: string;
  clusterName?: string;
  lensVersion?: string;
  lensTheme?: string;
  username?: string;
  token?: string;
  allowedNamespaces?: string[];
  allowedResources?: string[];
  isClusterAdmin?: boolean;
  chartsEnabled: boolean;
  kubectlAccess?: boolean;  // User accessed via kubectl-lens plugin
}

// TODO: auto-populate all resources dynamically
const apiResources = [
  { resource: "configmaps" },
  { resource: "cronjobs", group: "batch" },
  { resource: "customresourcedefinitions", group: "apiextensions.k8s.io" },
  { resource: "daemonsets", group: "apps" },
  { resource: "deployments", group: "apps" },
  { resource: "endpoints" },
  { resource: "events" },
  { resource: "horizontalpodautoscalers" },
  { resource: "ingresses", group: "networking.k8s.io" },
  { resource: "jobs", group: "batch" },
  { resource: "namespaces" },
  { resource: "networkpolicies", group: "networking.k8s.io" },
  { resource: "nodes" },
  { resource: "persistentvolumes" },
  { resource: "pods" },
  { resource: "podsecuritypolicies" },
  { resource: "resourcequotas" },
  { resource: "secrets" },
  { resource: "services" },
  { resource: "statefulsets", group: "apps" },
  { resource: "storageclasses", group: "storage.k8s.io" },
]

async function getAllowedNamespaces(cluster: Cluster) {
  const api = cluster.contextHandler.kc.makeApiClient(CoreV1Api)
  try {
    const namespaceList = await api.listNamespace()
    const nsAccessStatuses = await Promise.all(
      namespaceList.body.items.map(ns => cluster.canI({
        namespace: ns.metadata.name,
        resource: "pods",
        verb: "list",
      }))
    )
    return namespaceList.body.items
      .filter((ns, i) => nsAccessStatuses[i])
      .map(ns => ns.metadata.name)
  } catch (error) {
    const kc = cluster.contextHandler.kc
    const ctx = kc.getContextObject(kc.currentContext)
    if (ctx.namespace) {
      return [ctx.namespace]
    }
    else {
      return []
    }
  }
}

async function getAllowedResources(cluster: Cluster, namespaces: string[]) {
  try {
    const resourceAccessStatuses = await Promise.all(
      apiResources.map(apiResource => cluster.canI({
        resource: apiResource.resource,
        group: apiResource.group,
        verb: "list",
        namespace: namespaces[0]
      }))
    )
    return apiResources
      .filter((resource, i) => resourceAccessStatuses[i]).map(apiResource => apiResource.resource)
  } catch (error) {
    return []
  }
}

class ConfigRoute extends LensApi {
  public async routeConfig(request: LensApiRequest) {
    const { params, response, cluster } = request

    const namespaces = await getAllowedNamespaces(cluster)
    const data: IConfigRoutePayload = {
      clusterName: cluster.contextName,
      lensVersion: app.getVersion(),
      lensTheme: `kontena-${userStore.getPreferences().colorTheme}`,
      kubeVersion: cluster.version,
      chartsEnabled: true,
      isClusterAdmin: cluster.isAdmin,
      allowedResources: await getAllowedResources(cluster, namespaces),
      allowedNamespaces: namespaces
    };

    this.respondJson(response, data)
  }
}

export const configRoute = new ConfigRoute()
