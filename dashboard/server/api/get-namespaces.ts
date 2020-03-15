// Get namespaces

import config from "../config";
import { KubeJsonApiDataList } from "../../client/api/kube-json-api";
import { IKubeRequestParams, kubeRequest } from "./kube-request";
import { reviewResourceAccess } from "./review-resource-access";
import { getServiceAccountToken } from "./get-service-account-token"

export async function getNamespaces(params: Partial<IKubeRequestParams> = {}) {
  return kubeRequest<KubeJsonApiDataList>({
    ...params,
    path: "/api/v1/namespaces",
  });
}

export async function getAllowedNamespaces(
  params: Partial<IKubeRequestParams>,
  fallbackNs = config.KUBERNETES_NAMESPACE,
): Promise<string[]> {
  try {
    const allNamespaces = await getNamespaces(params);
    const nsAccessStatuses = await Promise.all(
      allNamespaces.items.map(ns => {
        const { name } = ns.metadata;
        return reviewResourceAccess(params, {
          namespace: name,
          resource: "pods",
          verb: "list",
        });
      })
    );
    return allNamespaces.items
      .filter((ns, i) => nsAccessStatuses[i].allowed)
      .map(ns => ns.metadata.name);
  } catch (e) {
    const serviceToken = await getServiceAccountToken();
    if (!serviceToken) {
      return fallbackNs ? [fallbackNs] : [];
    }
    // fetch namespaces with service-account token (cluster-wide)
    // and for every namespace make additional request to check if namespace available for user-token
    const allNamespaces = await getNamespaces({
      authHeader: `Bearer ${serviceToken}`
    });
    const nsAccessStatuses = await Promise.all(
      allNamespaces.items.map(ns => {
        const { name } = ns.metadata;
        return reviewResourceAccess(params, {
          namespace: name,
          resource: "pods",
          verb: "list",
        });
      })
    );
    return allNamespaces.items
      .filter((ns, i) => nsAccessStatuses[i].allowed)
      .map(ns => ns.metadata.name);
  }
}
