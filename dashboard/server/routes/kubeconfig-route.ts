//-- Kubeconfig route

import { Router } from "express";
import { AxiosError } from "axios";
import { userSession } from "../user-session";
import { kubeRequest } from "../api/kube-request";
import { Secret } from "../../client/api/endpoints";
import { base64 } from "../../client/utils/base64";
import { getCertificateAuthorityData } from "../api/get-cert-auth-data";
import { getClusterConfigMap } from "../api/get-cluster-info";

interface IKubeConfigParams {
  username: string;
  authToken: string;
  certificateAuthority: string;
  namespace?: string;
}

export function kubeconfigRoute() {
  const router = Router();

  router.route('/kubeconfig/user')
    .get(async (req, res) => {
      const { username = "kubernetes" } = userSession.get(req);
      const authToken = userSession.getToken(req);
      const cert = await getCertificateAuthorityData('base64');
      const data = await generateKubeConfig({
        username,
        authToken: authToken,
        certificateAuthority: cert
      });
      res.json(data);
    });

  router.route('/kubeconfig/service-account/:namespace/:account')
    .get(async (req, res) => {
      const { authHeader } = userSession.get(req);
      const { namespace, account } = req.params;
      try {
        const secret = await kubeRequest<{ items: Secret[] }>({
          path: `/api/v1/namespaces/${namespace}/secrets`,
          authHeader: authHeader,
        }).then(secrets => {
          return secrets.items.find(secret => {
            const { annotations } = secret.metadata;
            return annotations && annotations["kubernetes.io/service-account.name"] == account;
          });
        });
        const data = await generateKubeConfig({
          username: account,
          namespace: namespace,
          authToken: base64.decode(secret.data.token),
          certificateAuthority: secret.data["ca.crt"],
        });
        res.json(data);
      } catch (err) {
        const { response }: AxiosError = err;
        res.status(403).json(response ? response.data : err.toString());
      }
    });

  return router;
}

async function generateKubeConfig(params: IKubeConfigParams) {
  const { clusterName, clusterUrl } = await getClusterConfigMap();
  const { authToken, username, certificateAuthority, namespace = "" } = params;
  return {
    'apiVersion': 'v1',
    'kind': 'Config',
    'clusters': [
      {
        'name': clusterName,
        'cluster': {
          'server': clusterUrl,
          'certificate-authority-data': certificateAuthority
        }
      }
    ],
    'users': [
      {
        'name': username,
        'user': {
          'token': authToken,
        }
      }
    ],
    'contexts': [
      {
        'name': clusterName,
        'context': {
          'user': username,
          'cluster': clusterName,
          'namespace': namespace,
        }
      }
    ],
    'current-context': clusterName
  }
}
