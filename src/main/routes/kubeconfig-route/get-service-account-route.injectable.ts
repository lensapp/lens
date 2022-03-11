/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { apiPrefix } from "../../../common/vars";
import type { Route } from "../../router/router";
import { routeInjectionToken } from "../../router/router.injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import { CoreV1Api, V1Secret } from "@kubernetes/client-node";

const getServiceAccountRouteInjectable = getInjectable({
  id: "get-service-account-route",

  instantiate: (): Route<ReturnType<typeof generateKubeConfig>> => ({
    method: "get",
    path: `${apiPrefix}/kubeconfig/service-account/{namespace}/{account}`,

    handler: async (request) => {
      const { params, cluster } = request;
      const client = (await cluster.getProxyKubeconfig()).makeApiClient(CoreV1Api);
      const secretList = await client.listNamespacedSecret(params.namespace);

      const secret = secretList.body.items.find(secret => {
        const { annotations } = secret.metadata;

        return annotations && annotations["kubernetes.io/service-account.name"] == params.account;
      });

      return { response: generateKubeConfig(params.account, secret, cluster) };
    },
  }),

  injectionToken: routeInjectionToken,
});

export default getServiceAccountRouteInjectable;

function generateKubeConfig(username: string, secret: V1Secret, cluster: Cluster) {
  const tokenData = Buffer.from(secret.data["token"], "base64");

  return {
    "apiVersion": "v1",
    "kind": "Config",
    "clusters": [
      {
        "name": cluster.contextName,
        "cluster": {
          "server": cluster.apiUrl,
          "certificate-authority-data": secret.data["ca.crt"],
        },
      },
    ],
    "users": [
      {
        "name": username,
        "user": {
          "token": tokenData.toString("utf8"),
        },
      },
    ],
    "contexts": [
      {
        "name": cluster.contextName,
        "context": {
          "user": username,
          "cluster": cluster.contextName,
          "namespace": secret.metadata.namespace,
        },
      },
    ],
    "current-context": cluster.contextName,
  };
}
