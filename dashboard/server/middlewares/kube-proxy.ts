import { Request } from "express";
import proxy from "http-proxy-middleware"
import { userSession } from "../user-session";
import config, { isSecure } from "../config";

export function kubeProxy(serviceUrl: string, proxyConfig: proxy.Config = {}) {
  const { IS_PRODUCTION } = config;
  return proxy({
    target: serviceUrl,
    secure: isSecure(), // verify the ssl certs
    logLevel: IS_PRODUCTION ? "info" : "debug",
    changeOrigin: true, // needed for virtual hosted sites
    pathRewrite: (path, req: Request) => {
      return path.replace(req.baseUrl, ""); // remove client-prefix, e.g "/api-kube"
    },
    onProxyReq(proxyReq, req: Request, res) {
      const { authHeader } = userSession.get(req);
      if (authHeader) {
        proxyReq.setHeader("Authorization", authHeader);
      }
    },
    ...proxyConfig,
  })
}
