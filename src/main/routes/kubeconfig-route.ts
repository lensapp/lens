import { LensApiRequest } from "../router";
import { LensApi } from "../lens-api";
import { Cluster } from "../cluster";
import { CoreV1Api, V1Secret } from "@kubernetes/client-node";
import logger from "../logger";
import { assert } from "../../common/utils";
import { AssertionError } from "assert";

function generateKubeConfig(username: string, secret: V1Secret, cluster: Cluster) {
  if (!secret.data) {
    return;
  }

  const tokenData = Buffer.from(secret.data["token"], "base64");

  return {
    "apiVersion": "v1",
    "kind": "Config",
    "clusters": [
      {
        "name": cluster.contextName,
        "cluster": {
          "server": cluster.apiUrl,
          "certificate-authority-data": secret.data["ca.crt"]
        }
      }
    ],
    "users": [
      {
        "name": username,
        "user": {
          "token": tokenData.toString("utf8"),
        }
      }
    ],
    "contexts": [
      {
        "name": cluster.contextName,
        "context": {
          "user": username,
          "cluster": cluster.contextName,
          "namespace": secret.metadata?.namespace,
        }
      }
    ],
    "current-context": cluster.contextName
  };
}

class KubeconfigRoute extends LensApi {

  public async routeServiceAccountRoute(request: LensApiRequest) {
    const { params, response, cluster: maybeCluster } = request;

    try {
      const cluster = assert(maybeCluster, "No Cluster defined on request");
      const namespace = assert(params.namespace, "Namespace not provided");
      const account = assert(params.account, "AccountName not provided");

      const client = (await cluster.getProxyKubeconfig()).makeApiClient(CoreV1Api);
      const secretList = await client.listNamespacedSecret(namespace);
      const secret = assert(
        secretList.body.items
          .find(({ metadata }) => (
            metadata?.annotations?.["kubernetes.io/service-account.name"] == account
          )),
        "No secret found matching the account name",
      );

      const data = generateKubeConfig(account, secret, cluster);

      this.respondJson(response, data ?? {});
    } catch (error) {
      logger.error(`[KUBECONFIG-ROUTE]: routeServiceAccount failed: ${error}`);

      if (error instanceof AssertionError) {
        this.respondText(response, error.message, 404);
      } else {
        this.respondText(response, error.toString(), 404);
      }
    }
  }
}

export const kubeconfigRoute = new KubeconfigRoute();
