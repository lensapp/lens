/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiPrefix } from "../../../common/vars";
import { getRouteInjectable } from "../../router/router.injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import type { V1Secret } from "@kubernetes/client-node";
import { CoreV1Api } from "@kubernetes/client-node";
import { clusterRoute } from "../../router/route";

const getServiceAccountRouteInjectable = getRouteInjectable({
  id: "get-service-account-route",

  instantiate: () => clusterRoute({
    method: "get",
    path: `${apiPrefix}/kubeconfig/service-account/{namespace}/{account}`,
  })(async ({ params, cluster }) => {
    const client = (await cluster.getProxyKubeconfig()).makeApiClient(CoreV1Api);
    const secretList = await client.listNamespacedSecret(params.namespace);

    const secret = secretList.body.items.find(secret => {
      const { annotations } = secret.metadata ?? {};

      return annotations?.["kubernetes.io/service-account.name"] === params.account;
    });

    if (!secret) {
      return {
        error: "No secret found",
        statusCode: 404,
      };
    }

    const kubeconfig = generateKubeConfig(params.account, secret, cluster);

    if (!kubeconfig) {
      return {
        error: "No secret found",
        statusCode: 404,
      };
    }

    return {
      response: kubeconfig,
    };
  }),
});

export default getServiceAccountRouteInjectable;

interface ServiceAccountKubeConfig {
  apiVersion: string;
  kind: string;
  clusters: {
    name: string;
    cluster: {
      server: string;
      "certificate-authority-data": string;
    };
  }[];
  users: {
    name: string;
    user: {
      token: string;
    };
  }[];
  contexts: {
    name: string;
    context: {
      user: string;
      cluster: string;
      namespace: string | undefined;
    };
  }[];
  "current-context": string;
}

function generateKubeConfig(username: string, secret: V1Secret, cluster: Cluster): ServiceAccountKubeConfig | undefined {
  if (!secret.data || !secret.metadata) {
    return undefined;
  }

  const { token, "ca.crt": caCrt } = secret.data;

  const tokenData = Buffer.from(token, "base64");

  return {
    "apiVersion": "v1",
    "kind": "Config",
    "clusters": [
      {
        "name": cluster.contextName,
        "cluster": {
          "server": cluster.apiUrl,
          "certificate-authority-data": caCrt,
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
