/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeConfig } from "@kubernetes/client-node";
import yaml from "js-yaml";
import type { Cluster, Context, User } from "@kubernetes/client-node/dist/config_types";
import { newClusters, newContexts, newUsers } from "@kubernetes/client-node/dist/config_types";
import type { Result } from "@k8slens/utilities";
import { isDefined } from "@k8slens/utilities";
import type { PartialDeep } from "type-fest";
import z from "zod";
import type { ZodError } from "zod";

const userSchema = z.object({
  name: z.string()
    .min(1),
});

const clusterSchema = z.object({
  name: z
    .string()
    .min(1),
  cluster: z
    .object({
      server: z
        .string()
        .min(1),
    }),
});

const contextSchema = z.object({
  name: z.string()
    .min(1),
  context: z.object({
    cluster: z.string()
      .min(1),
    user: z.string()
      .min(1),
  }),
});

const kubeConfigSchema = z.object({
  users: z
    .array(userSchema)
    .optional(),
  clusters: z
    .array(clusterSchema)
    .optional(),
  contexts: z
    .array(contextSchema)
    .optional(),
  "current-context": z
    .string()
    .min(1)
    .optional(),
});

interface KubeConfigOptions {
  clusters: Cluster[];
  users: User[];
  contexts: Context[];
  currentContext?: string;
}

function loadToOptions(rawYaml: string): Result<KubeConfigOptions, ZodError<unknown>> {
  const parsed = yaml.load(rawYaml);
  const configParseResult = kubeConfigSchema.safeParse(parsed);

  if (configParseResult.success === false) {
    return {
      isOk: false,
      error: configParseResult.error,
    };
  }

  return {
    isOk: true,
    value: {
      clusters: newClusters(configParseResult.data.clusters),
      users: newUsers(configParseResult.data.users),
      contexts: newContexts(configParseResult.data.contexts),
      currentContext: configParseResult.data["current-context"],
    },
  };
}

export function loadFromOptions(options: KubeConfigOptions): KubeConfig {
  const kc = new KubeConfig();

  // need to load using the kubernetes client to generate a kubeconfig object
  kc.loadFromOptions(options);

  return kc;
}

export function loadConfigFromString(content: string): Result<KubeConfig, ZodError<unknown>> {
  const loadResult = loadToOptions(content);

  if (loadResult.isOk === false) {
    return loadResult;
  }

  return {
    isOk: true,
    value: loadFromOptions(loadResult.value),
  };
}

export function loadValidatedConfig(content: string, contextName: string): Result<PartialKubeConfig, ZodError<unknown> | string> {
  const result = loadToOptions(content);

  if (result.isOk === false) {
    return result;
  }

  return validateKubeConfig(loadFromOptions(result.value), contextName);
}

export interface SplitConfigEntry {
  config: KubeConfig;
  validationResult: Result<PartialKubeConfig, ZodError<unknown> | string>;
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
      validationResult: validateKubeConfig(config, ctx.name),
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
        "auth-provider": user.authProvider as unknown,
        exec: user.exec as unknown,
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

  // skipInvalid: true makes dump ignore undefined values
  return yaml.dump(config, { skipInvalid: true });
}

export interface PartialKubeConfig {
  readonly context: Context;
  readonly cluster: Cluster;
  readonly user: User;
}

/**
 * Checks if `config` has valid `Context`, `User`, `Cluster`, and `exec` fields (if present when required)
 *
 * Note: This function returns an error instead of throwing it, returning `undefined` if the validation passes
 */
export function validateKubeConfig(config: KubeConfig, contextName: string): Result<PartialKubeConfig, string> {
  const context = config.getContextObject(contextName);

  if (!context) {
    return {
      isOk: false,
      error: `No valid context object provided in kubeconfig for context '${contextName}'`,
    };
  }

  const cluster = config.getCluster(context.cluster);

  if (!cluster) {
    return {
      isOk: false,
      error: `No valid cluster object provided in kubeconfig for context '${contextName}'`,
    };
  }

  const user = config.getUser(context.user);

  if (!user) {
    return {
      isOk: false,
      error: `No valid user object provided in kubeconfig for context '${contextName}'`,
    };
  }

  return {
    isOk: true,
    value: { cluster, user, context },
  };
}
