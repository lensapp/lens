//-- Config route

import config from "../config";
import { IConfig } from "../common/config"
import { Router } from "express";
import { userSession } from "../user-session";
import { getClusterInfo } from "../api/get-cluster-info";
import { isClusterAdmin } from "../api/is-cluster-admin";
import { getAllowedNamespaces } from "../api/get-namespaces";
import { parseJwt } from "../utils/parse-jwt";

export function configRoute() {
  const router = Router();

  router.route('/config')
    .get(async (req, res) => {
      const { username, authHeader } = userSession.get(req);
      const authToken = userSession.getToken(req);

      const data: IConfig = {
        clusterName: config.KUBE_CLUSTER_NAME,
        lensVersion: config.LENS_VERSION,
        lensTheme: config.LENS_THEME,
        chartsEnabled: !!config.CHARTS_ENABLED,
        kubectlAccess: !!req.headers["x-lens-kubectl-token"]
      };

      // load config data from other places
      const loading: Promise<any>[] = [
        getClusterInfo().then(info => Object.assign(data, info)),
      ];

      // validate user token from session and fetch more config data
      if (authToken) {
        const { sub, email } = parseJwt(authToken);
        data.username = email || sub || username;
        data.token = authToken;
        loading.push(
          isClusterAdmin({ authHeader }).then(isAdmin => data.isClusterAdmin = isAdmin),
          getAllowedNamespaces({ authHeader }).then(list => data.allowedNamespaces = list),
        );
      }
      await Promise.all(loading);
      res.json(data);
    });

  return router;
}
