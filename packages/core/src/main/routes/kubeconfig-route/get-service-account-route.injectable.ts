/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiPrefix } from "../../../common/vars";
import { getRouteInjectable } from "../../router/router.injectable";
import { CoreV1Api } from "@kubernetes/client-node";
import { clusterRoute } from "../../router/route";
import * as yaml from "js-yaml";
import loadProxyKubeconfigInjectable from "../../cluster/load-proxy-kubeconfig.injectable";
import clusterApiUrlInjectable from "../../../features/cluster/connections/main/api-url.injectable";

const getServiceAccountRouteInjectable = getRouteInjectable({
  id: "get-service-account-route",

  instantiate: (di) => clusterRoute({
    method: "get",
    path: `${apiPrefix}/kubeconfig/service-account/{namespace}/{account}`,
  })(async ({ params, cluster }) => {
    const { namespace, account } = params;
    const loadProxyKubeconfig = di.inject(loadProxyKubeconfigInjectable, cluster);
    const proxyKubeconfig = await loadProxyKubeconfig();
    const client = proxyKubeconfig.makeApiClient(CoreV1Api);
    const { items } = await client.listNamespacedSecret({ namespace });

    const secret = items.find(secret => {
      const { annotations = {}} = secret.metadata ?? {};

      return annotations["kubernetes.io/service-account.name"] === params.account;
    });

    if (!secret || !secret.data || !secret.metadata) {
      return {
        error: "No secret found",
        statusCode: 404,
      };
    }

    const { token, "ca.crt": caCrt } = secret.data;
    const apiUrl = (await di.inject(clusterApiUrlInjectable, cluster)()).toString();
    const contextName = cluster.contextName.get();

    return {
      response: yaml.dump({
        apiVersion: "v1",
        kind: "Config",
        clusters: [
          {
            name: contextName,
            cluster: {
              server: apiUrl,
              "certificate-authority-data": caCrt,
            },
          },
        ],
        users: [
          {
            name: params.account,
            user: {
              token: Buffer.from(token, "base64").toString("utf8"),
            },
          },
        ],
        contexts: [
          {
            name: `${contextName}-${account}`,
            context: {
              user: params.account,
              cluster: contextName,
              namespace: secret.metadata.namespace,
            },
          },
        ],
        "current-context": contextName,
      }),
    };
  }),
});

export default getServiceAccountRouteInjectable;
