/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import yaml from "js-yaml";
import { MigrationDeclaration, migrationLog } from "../helpers";

export default {
  version: "2.6.0-beta.3",
  run(store) {
    for (const value of store) {
      const clusterKey = value[0];

      if (clusterKey === "__internal__") continue;
      const cluster = value[1];

      if (!cluster.kubeConfig) continue;
      const config = yaml.load(cluster.kubeConfig);

      if (!config || typeof config !== "object" || !Object.prototype.hasOwnProperty.call(config, "users")) {
        continue;
      }

      const kubeConfig = config as Record<string, any>;
      const userObj = kubeConfig.users[0];

      if (userObj) {
        const user = userObj.user;

        if (user["auth-provider"] && user["auth-provider"].config) {
          const authConfig = user["auth-provider"].config;

          if (authConfig["access-token"]) {
            authConfig["access-token"] = `${authConfig["access-token"]}`;
          }

          if (authConfig.expiry) {
            authConfig.expiry = `${authConfig.expiry}`;
          }
          migrationLog(authConfig);
          user["auth-provider"].config = authConfig;
          kubeConfig.users = [{
            name: userObj.name,
            user,
          }];
          cluster.kubeConfig = yaml.dump(kubeConfig);
          store.set(clusterKey, cluster);
        }
      }
    }
  },
} as MigrationDeclaration;
