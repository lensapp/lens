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

import type { LensApiRequest } from "../router";
import { respondJson } from "../utils/http-responses";
import type { Cluster } from "../cluster";
import { CoreV1Api, V1Secret } from "@kubernetes/client-node";

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

export class KubeconfigRoute {
  static async routeServiceAccountRoute(request: LensApiRequest) {
    const { params, response, cluster } = request;
    const client = (await cluster.getProxyKubeconfig()).makeApiClient(CoreV1Api);
    const secretList = await client.listNamespacedSecret(params.namespace);
    const secret = secretList.body.items.find(secret => {
      const { annotations } = secret.metadata;

      return annotations && annotations["kubernetes.io/service-account.name"] == params.account;
    });
    const data = generateKubeConfig(params.account, secret, cluster);

    respondJson(response, data);
  }
}
