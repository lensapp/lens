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

import { KubeConfig, V1Node, V1Pod } from "@kubernetes/client-node";
import fse from "fs-extra";
import path from "path";
import os from "os";
import yaml from "js-yaml";
import logger from "../main/logger";
import commandExists from "command-exists";
import { ExecValidationNotFoundError } from "./custom-errors";
import { Cluster, Context, newClusters, newContexts, newUsers, User } from "@kubernetes/client-node/dist/config_types";

export type KubeConfigValidationOpts = {
  validateCluster?: boolean;
  validateUser?: boolean;
  validateExec?: boolean;
};

export const kubeConfigDefaultPath = path.join(os.homedir(), ".kube", "config");

function resolveTilde(filePath: string) {
  if (filePath[0] === "~" && (filePath[1] === "/" || filePath.length === 1)) {
    return filePath.replace("~", os.homedir());
  }

  return filePath;
}

function readResolvedPathSync(filePath: string): string {
  return fse.readFileSync(path.resolve(resolveTilde(filePath)), "utf8");
}

function checkRawCluster(rawCluster: any): boolean {
  return Boolean(rawCluster?.name && rawCluster?.cluster?.server);
}

function checkRawUser(rawUser: any): boolean {
  return Boolean(rawUser?.name);
}

function checkRawContext(rawContext: any): boolean {
  return Boolean(rawContext.name && rawContext.context?.cluster && rawContext.context?.user);
}

export interface KubeConfigOptions {
  clusters: Cluster[];
  users: User[];
  contexts: Context[];
  currentContext: string;
}

function loadToOptions(rawYaml: string): KubeConfigOptions {
  const obj = yaml.safeLoad(rawYaml);

  if (typeof obj !== "object" || !obj) {
    throw new TypeError("KubeConfig root entry must be an object");
  }

  const { clusters: rawClusters, users: rawUsers, contexts: rawContexts, "current-context": currentContext } = obj;
  const clusters = newClusters(rawClusters?.filter(checkRawCluster));
  const users = newUsers(rawUsers?.filter(checkRawUser));
  const contexts = newContexts(rawContexts?.filter(checkRawContext));

  return { clusters, users, contexts, currentContext };
}

export function loadFromOptions(options: KubeConfigOptions): KubeConfig {
  const kc = new KubeConfig();

  // need to load using the kubernetes client to generate a kubeconfig object
  kc.loadFromOptions(options);

  return kc;
}

export function loadConfig(pathOrContent?: string): KubeConfig {
  return loadConfigFromString(
    fse.pathExistsSync(pathOrContent)
      ? readResolvedPathSync(pathOrContent)
      : pathOrContent
  );
}

export function loadConfigFromString(content: string): KubeConfig {
  return loadFromOptions(loadToOptions(content));
}

/**
 * KubeConfig is valid when there's at least one of each defined:
 * - User
 * - Cluster
 * - Context
 * @param config KubeConfig to check
 */
export function validateConfig(config: KubeConfig | string): KubeConfig {
  if (typeof config == "string") {
    config = loadConfig(config);
  }
  logger.debug(`validating kube config: ${JSON.stringify(config)}`);

  if (!config.users || config.users.length == 0) {
    throw new Error("No users provided in config");
  }

  if (!config.clusters || config.clusters.length == 0) {
    throw new Error("No clusters provided in config");
  }

  if (!config.contexts || config.contexts.length == 0) {
    throw new Error("No contexts provided in config");
  }

  return config;
}

/**
 * Breaks kube config into several configs. Each context as it own KubeConfig object
 */
export function splitConfig(kubeConfig: KubeConfig): KubeConfig[] {
  const configs: KubeConfig[] = [];

  if (!kubeConfig.contexts) {
    return configs;
  }
  kubeConfig.contexts.forEach(ctx => {
    const kc = new KubeConfig();

    kc.clusters = [kubeConfig.getCluster(ctx.cluster)].filter(n => n);
    kc.users = [kubeConfig.getUser(ctx.user)].filter(n => n);
    kc.contexts = [kubeConfig.getContextObject(ctx.name)].filter(n => n);
    kc.setCurrentContext(ctx.name);

    configs.push(kc);
  });

  return configs;
}

export function dumpConfigYaml(kubeConfig: Partial<KubeConfig>): string {
  const config = {
    apiVersion: "v1",
    kind: "Config",
    preferences: {},
    "current-context": kubeConfig.currentContext,
    clusters: kubeConfig.clusters.map(cluster => {
      return {
        name: cluster.name,
        cluster: {
          "certificate-authority-data": cluster.caData,
          "certificate-authority": cluster.caFile,
          server: cluster.server,
          "insecure-skip-tls-verify": cluster.skipTLSVerify
        }
      };
    }),
    contexts: kubeConfig.contexts.map(context => {
      return {
        name: context.name,
        context: {
          cluster: context.cluster,
          user: context.user,
          namespace: context.namespace
        }
      };
    }),
    users: kubeConfig.users.map(user => {
      return {
        name: user.name,
        user: {
          "client-certificate-data": user.certData,
          "client-certificate": user.certFile,
          "client-key-data": user.keyData,
          "client-key": user.keyFile,
          "auth-provider": user.authProvider,
          exec: user.exec,
          token: user.token,
          username: user.username,
          password: user.password
        }
      };
    })
  };

  logger.debug("Dumping KubeConfig:", config);

  // skipInvalid: true makes dump ignore undefined values
  return yaml.safeDump(config, { skipInvalid: true });
}

export function podHasIssues(pod: V1Pod) {
  // Logic adapted from dashboard
  const notReady = !!pod.status.conditions.find(condition => {
    return condition.type == "Ready" && condition.status !== "True";
  });

  return (
    notReady ||
    pod.status.phase !== "Running" ||
    pod.spec.priority > 500000 // We're interested in high priority pods events regardless of their running status
  );
}

export function getNodeWarningConditions(node: V1Node) {
  return node.status?.conditions?.filter(c =>
    c.status.toLowerCase() === "true" && c.type !== "Ready" && c.type !== "HostUpgrades"
  ) ?? [];
}

/**
 * Checks if `config` has valid `Context`, `User`, `Cluster`, and `exec` fields (if present when required)
 *
 * Note: This function returns an error instead of throwing it, returning `undefined` if the validation passes
 */
export function validateKubeConfig(config: KubeConfig, contextName: string, validationOpts: KubeConfigValidationOpts = {}): Error | void {
  try {
    // we only receive a single context, cluster & user object here so lets validate them as this
    // will be called when we add a new cluster to Lens

    const { validateUser = true, validateCluster = true, validateExec = true } = validationOpts;

    const contextObject = config.getContextObject(contextName);

    // Validate the Context Object
    if (!contextObject) {
      return new Error(`No valid context object provided in kubeconfig for context '${contextName}'`);
    }

    // Validate the Cluster Object
    if (validateCluster && !config.getCluster(contextObject.cluster)) {
      return new Error(`No valid cluster object provided in kubeconfig for context '${contextName}'`);
    }

    const user = config.getUser(contextObject.user);

    // Validate the User Object
    if (validateUser && !user) {
      return new Error(`No valid user object provided in kubeconfig for context '${contextName}'`);
    }

    // Validate exec command if present
    if (validateExec && user?.exec) {
      const execCommand = user.exec["command"];
      // check if the command is absolute or not
      const isAbsolute = path.isAbsolute(execCommand);

      // validate the exec struct in the user object, start with the command field
      if (!commandExists.sync(execCommand)) {
        return new ExecValidationNotFoundError(execCommand, isAbsolute);
      }
    }
  } catch (error) {
    return error;
  }
}
