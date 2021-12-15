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
