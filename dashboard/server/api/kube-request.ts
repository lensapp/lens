// Kubernetes request api helper

import config, { isSecure } from "../config";
import axios, { AxiosError, AxiosRequestConfig } from "axios"
import * as https from "https";
import { getCertificateAuthorityData } from "./get-cert-auth-data";
import { logger, sanitizeHeaders } from "../utils/logger";
import { getServiceAccountToken } from "./get-service-account-token";

export interface IKubeRequestParams extends AxiosRequestConfig {
  path: string;
  authHeader?: string;
}

export async function kubeRequest<T>(params: IKubeRequestParams): Promise<T> {
  const { KUBE_CLUSTER_URL, KUBERNETES_CLIENT_CERT, KUBERNETES_CLIENT_KEY } = config;
  const serviceToken = await getServiceAccountToken();
  const defaultAuthHeader = serviceToken ? `Bearer ${serviceToken}` : "";
  const {
    authHeader = defaultAuthHeader,
    url = KUBE_CLUSTER_URL,
    path = "",
    ...reqConfig
  } = params;

  // add access token
  reqConfig.headers = Object.assign({}, reqConfig.headers, {
    "Content-type": "application/json",
  });

  if (!KUBERNETES_CLIENT_CERT && authHeader) {
    reqConfig.headers["Authorization"] = authHeader;
  }

  // allow requests to kube-cluster without valid ssl certs..
  reqConfig.httpsAgent = new https.Agent({
    rejectUnauthorized: isSecure(),
    cert: KUBERNETES_CLIENT_CERT,
    key: KUBERNETES_CLIENT_KEY,
    ca: await getCertificateAuthorityData(),
  });

  const reqUrl = url + path;

  return axios(reqUrl, reqConfig)
    .then(res => res.data)
    .catch((error: AxiosError<T>) => {
      const { message, config } = error;
      logger.error(`[KUBE-REQUEST]: ${message}`, {
        code: error.code,
        method: config.method,
        url: config.url,
        headers: sanitizeHeaders(config.headers),
        params: config.params,
      });
      throw error;
    });
}
