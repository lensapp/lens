import { LensApiRequest } from "../router"
import { LensApi } from "../lens-api"
import { userStore } from "../../common/user-store"
import { getAppVersion } from "../../common/app-utils"
import { CoreV1Api, AuthorizationV1Api } from "@kubernetes/client-node"
import { Cluster } from "../cluster"


function selfSubjectAccessReview(authApi: AuthorizationV1Api, namespace: string) {
  return authApi.createSelfSubjectAccessReview({
    apiVersion: "authorization.k8s.io/v1",
    kind: "SelfSubjectAccessReview",
    spec: {
      resourceAttributes: {
        namespace: namespace,
        resource: "pods",
        verb: "list",
      }
    }
  })
}

async function getAllowedNamespaces(cluster: Cluster) {
  const api = cluster.contextHandler.kc.makeApiClient(CoreV1Api)
  const authApi = cluster.contextHandler.kc.makeApiClient(AuthorizationV1Api)
  try {
    const namespaceList = await api.listNamespace()
    const nsAccessStatuses = await Promise.all(
      namespaceList.body.items.map(ns => {
        return selfSubjectAccessReview(authApi, ns.metadata.name)
      })
    )
    return namespaceList.body.items
      .filter((ns, i) => nsAccessStatuses[i].body.status.allowed)
      .map(ns => ns.metadata.name)
  } catch(error) {
    const kc = cluster.contextHandler.kc
    const ctx = kc.getContextObject(kc.currentContext)
    if (ctx.namespace) {
      return [ctx.namespace]
    } else {
      return []
    }
  }
}

class ConfigRoute extends LensApi {

  public async routeConfig(request: LensApiRequest) {
    const { params, response, cluster} = request

    const data = {
      clusterName: cluster.contextName,
      lensVersion: getAppVersion(),
      lensTheme: `kontena-${userStore.getPreferences().colorTheme}`,
      kubeVersion: cluster.version,
      chartsEnabled: true,
      isClusterAdmin: cluster.isAdmin,
      allowedNamespaces: await getAllowedNamespaces(cluster)
    };

    this.respondJson(response, data)
  }
}

export const configRoute = new ConfigRoute()
