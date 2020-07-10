import { KubeConfig, V1Node, V1Pod } from "@kubernetes/client-node"
import path from "path"
import os from "os"
import yaml from "js-yaml"
import logger from "./logger";

function resolveTilde(filePath: string) {
  if (filePath[0] === "~" && (filePath[1] === "/" || filePath.length === 1)) {
    return filePath.replace("~", os.homedir());
  }
  return filePath;
}

export function loadKubeConfig(pathOrContent?: string): KubeConfig {
  const kc = new KubeConfig();
  if (path.isAbsolute(pathOrContent)) {
    kc.loadFromFile(resolveTilde(pathOrContent));
  } else {
    kc.loadFromString(pathOrContent);
  }
  return kc
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
    config = loadKubeConfig(config);
  }
  logger.debug(`validating kube config: ${JSON.stringify(config)}`)
  if (!config.users || config.users.length == 0) {
    throw new Error("No users provided in config")
  }
  if (!config.clusters || config.clusters.length == 0) {
    throw new Error("No clusters provided in config")
  }
  if (!config.contexts || config.contexts.length == 0) {
    throw new Error("No contexts provided in config")
  }

  return config
}

/**
 * Breaks kube config into several configs. Each context as it own KubeConfig object
 */
export function splitConfig(kubeConfig: KubeConfig): KubeConfig[] {
  const configs: KubeConfig[] = []
  if (!kubeConfig.contexts) {
    return configs;
  }
  kubeConfig.contexts.forEach(ctx => {
    const kc = new KubeConfig();
    kc.clusters = [kubeConfig.getCluster(ctx.cluster)].filter(n => n);
    kc.users = [kubeConfig.getUser(ctx.user)].filter(n => n)
    kc.contexts = [kubeConfig.getContextObject(ctx.name)].filter(n => n)
    kc.setCurrentContext(ctx.name);

    configs.push(kc);
  });
  return configs;
}

/**
 * Loads KubeConfig from a yaml and breaks it into several configs. Each context per KubeConfig object
 *
 * @param configPath path to kube config yaml file
 */
export function loadAndSplitConfig(configPath: string): KubeConfig[] {
  const allConfigs = new KubeConfig();
  allConfigs.loadFromFile(configPath);
  return splitConfig(allConfigs);
}

export function dumpConfigYaml(kc: KubeConfig): string {
  const config = {
    apiVersion: "v1",
    kind: "Config",
    preferences: {},
    'current-context': kc.currentContext,
    clusters: kc.clusters.map(c => {
      return {
        name: c.name,
        cluster: {
          'certificate-authority-data': c.caData,
          'certificate-authority': c.caFile,
          server: c.server,
          'insecure-skip-tls-verify': c.skipTLSVerify
        }
      }
    }),
    contexts: kc.contexts.map(c => {
      return {
        name: c.name,
        context: {
          cluster: c.cluster,
          user: c.user,
          namespace: c.namespace
        }
      }
    }),
    users: kc.users.map(u => {
      return {
        name: u.name,
        user: {
          'client-certificate-data': u.certData,
          'client-certificate': u.certFile,
          'client-key-data': u.keyData,
          'client-key': u.keyFile,
          'auth-provider': u.authProvider,
          exec: u.exec,
          token: u.token,
          username: u.username,
          password: u.password
        }
      }
    })
  }

  console.log("dumping kc:", config);

  // skipInvalid: true makes dump ignore undefined values
  return yaml.safeDump(config, { skipInvalid: true });
}

export function podHasIssues(pod: V1Pod) {
  // Logic adapted from dashboard
  const notReady = !!pod.status.conditions.find(condition => {
    return condition.type == "Ready" && condition.status !== "True"
  });

  return (
    notReady ||
    pod.status.phase !== "Running" ||
    pod.spec.priority > 500000 // We're interested in high prio pods events regardless of their running status
  )
}

// Logic adapted from dashboard
// see: https://github.com/kontena/kontena-k8s-dashboard/blob/7d8f9cb678cc817a22dd1886c5e79415b212b9bf/client/api/endpoints/nodes.api.ts#L147
export function getNodeWarningConditions(node: V1Node) {
  return node.status.conditions.filter(c =>
    c.status.toLowerCase() === "true" && c.type !== "Ready" && c.type !== "HostUpgrades"
  )
}
