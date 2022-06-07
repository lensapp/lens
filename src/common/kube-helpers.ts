/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeConfig } from "@kubernetes/client-node";
import fse from "fs-extra";
import path from "path";
import os from "os";
import yaml from "js-yaml";
import logger from "../main/logger";
import type { Cluster, Context, User } from "@kubernetes/client-node/dist/config_types";
import { newClusters, newContexts, newUsers } from "@kubernetes/client-node/dist/config_types";
import { isDefined, resolvePath } from "./utils";
import Joi from "joi";
import type { PartialDeep } from "type-fest";

export const kubeConfigDefaultPath = path.join(os.homedir(), ".kube", "config");

export function loadConfigFromFileSync(filePath: string): ConfigResult {
  const content = fse.readFileSync(resolvePath(filePath), "utf-8");

  return loadConfigFromString(content);
}

export async function loadConfigFromFile(filePath: string): Promise<ConfigResult> {
  const content = await fse.readFile(resolvePath(filePath), "utf-8");

  return loadConfigFromString(content);
}

const clusterSchema = Joi.object({
  name: Joi
    .string()
    .min(1)
    .required(),
  cluster: Joi
    .object({
      server: Joi
        .string()
        .min(1)
        .required(),
    })
    .required(),
});

const userSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .required(),
});

const contextSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .required(),
  context: Joi.object({
    cluster: Joi.string()
      .min(1)
      .required(),
    user: Joi.string()
      .min(1)
      .required(),
  }),
});

const kubeConfigSchema = Joi.object({
  users: Joi
    .array()
    .items(userSchema)
    .optional(),
  clusters: Joi
    .array()
    .items(clusterSchema)
    .optional(),
  contexts: Joi
    .array()
    .items(contextSchema)
    .optional(),
  "current-context": Joi
    .string()
    .min(1)
    .optional(),
})
  .required();

interface KubeConfigOptions {
  clusters: Cluster[];
  users: User[];
  contexts: Context[];
  currentContext?: string;
}

interface OptionsResult {
  options: KubeConfigOptions;
  error: Joi.ValidationError | undefined;
}

function loadToOptions(rawYaml: string): OptionsResult {
  const parsed = yaml.load(rawYaml);
  const { error } = kubeConfigSchema.validate(parsed, {
    abortEarly: false,
    allowUnknown: true,
  });
  const { value } = kubeConfigSchema.validate(parsed, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: {
      arrays: true,
    },
  });
  const {
    clusters: rawClusters,
    users: rawUsers,
    contexts: rawContexts,
    "current-context": currentContext,
  } = value ?? {};
  const clusters = newClusters(rawClusters);
  const users = newUsers(rawUsers);
  const contexts = newContexts(rawContexts);

  return {
    options: { clusters, users, contexts, currentContext },
    error,
  };
}

export function loadFromOptions(options: KubeConfigOptions): KubeConfig {
  const kc = new KubeConfig();

  // need to load using the kubernetes client to generate a kubeconfig object
  kc.loadFromOptions(options);

  return kc;
}

export interface ConfigResult {
  config: KubeConfig;
  error: Joi.ValidationError | undefined;
}

export function loadConfigFromString(content: string): ConfigResult {
  const { options, error } = loadToOptions(content);

  return {
    config: loadFromOptions(options),
    error,
  };
}

export interface SplitConfigEntry {
  config: KubeConfig;
  error?: string;
}

/**
 * Breaks kube config into several configs. Each context as it own KubeConfig object
 */
export function splitConfig(kubeConfig: KubeConfig): SplitConfigEntry[] {
  return kubeConfig.getContexts().map(ctx => {
    const config = new KubeConfig();
    const cluster = kubeConfig.getCluster(ctx.cluster);
    const user = kubeConfig.getUser(ctx.user);
    const context = kubeConfig.getContextObject(ctx.name);

    if (cluster) {
      config.addCluster(cluster);
    }

    if (user) {
      config.addUser(user);
    }

    if (context) {
      config.addContext(context);
    }

    config.setCurrentContext(ctx.name);

    return {
      config,
      error: validateKubeConfig(config, ctx.name)?.toString(),
    };
  });
}

/**
 * Pretty format the object as human readable yaml, such as would be on the filesystem
 * @param kubeConfig The kubeconfig object to format as pretty yaml
 * @returns The yaml representation of the kubeconfig object
 */
export function dumpConfigYaml(kubeConfig: PartialDeep<KubeConfig>): string {
  const clusters = kubeConfig.clusters
    ?.filter(isDefined)
    .map(cluster => ({
      name: cluster.name,
      cluster: {
        "certificate-authority-data": cluster.caData,
        "certificate-authority": cluster.caFile,
        server: cluster.server,
        "insecure-skip-tls-verify": cluster.skipTLSVerify,
      },
    }));
  const contexts = kubeConfig.contexts
    ?.filter(isDefined)
    .map(context => ({
      name: context.name,
      context: {
        cluster: context.cluster,
        user: context.user,
        namespace: context.namespace,
      },
    }));
  const users = kubeConfig.users
    ?.filter(isDefined)
    .map(user => ({
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
        password: user.password,
      },
    }));
  const config = {
    apiVersion: "v1",
    kind: "Config",
    preferences: {},
    "current-context": kubeConfig.currentContext,
    clusters,
    contexts,
    users,
  };

  logger.debug("Dumping KubeConfig:", config);

  // skipInvalid: true makes dump ignore undefined values
  return yaml.dump(config, { skipInvalid: true });
}

/**
 * Checks if `config` has valid `Context`, `User`, `Cluster`, and `exec` fields (if present when required)
 *
 * Note: This function returns an error instead of throwing it, returning `undefined` if the validation passes
 */
export function validateKubeConfig(config: KubeConfig, contextName: string): Error | undefined {
  const contextObject = config.getContextObject(contextName);

  if (!contextObject) {
    return new Error(`No valid context object provided in kubeconfig for context '${contextName}'`);
  }

  if (!config.getCluster(contextObject.cluster)) {
    return new Error(`No valid cluster object provided in kubeconfig for context '${contextName}'`);
  }

  if (!config.getUser(contextObject.user)) {
    return new Error(`No valid user object provided in kubeconfig for context '${contextName}'`);
  }

  return undefined;
}
