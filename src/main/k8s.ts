import * as k8s from "@kubernetes/client-node"
import * as os from "os"
import * as yaml from "js-yaml"
import logger from "./logger";

const kc = new k8s.KubeConfig()

function resolveTilde(filePath: string) {
  if (filePath[0] === "~" && (filePath[1] === "/" || filePath.length === 1)) {
    return filePath.replace("~", os.homedir());
  }
  return filePath;
}

export function loadConfig(kubeconfig: string): k8s.KubeConfig {
  if (kubeconfig) {
    kc.loadFromFile(resolveTilde(kubeconfig))
  } else {
    kc.loadFromDefault();
  }
  return kc
}

/**
 * KubeConfig is valid when there's atleast one of each defined:
 * - User
 * - Cluster
 * - Context
 *
 * @param config KubeConfig to check
 */
export function validateConfig(config: k8s.KubeConfig): boolean {
  logger.debug(`validating kube config: ${JSON.stringify(config)}`)
  if(!config.users || config.users.length == 0) {
    throw new Error("No users provided in config")
  }

  if(!config.clusters || config.clusters.length == 0) {
    throw new Error("No clusters provided in config")
  }

  if(!config.contexts || config.contexts.length == 0) {
    throw new Error("No contexts provided in config")
  }

  return true
}


/**
 * Breaks kube config into several configs. Each context as it own KubeConfig object
 *
 * @param configString yaml string of kube config
 */
export function splitConfig(kubeConfig: k8s.KubeConfig): k8s.KubeConfig[] {
  const configs: k8s.KubeConfig[] = []
  if(!kubeConfig.contexts) {
    return configs;
  }
  kubeConfig.contexts.forEach(ctx => {
    const kc = new k8s.KubeConfig();
    kc.clusters = [kubeConfig.getCluster(ctx.cluster)].filter(n => n);
    kc.users = [kubeConfig.getUser(ctx.user)].filter(n => n)
    kc.contexts = [kubeConfig.getContextObject(ctx.name)].filter(n => n)
    kc.setCurrentContext(ctx.name);

    configs.push(kc);
  });
  return configs;
}

/**
 * Loads KubeConfig from a yaml string and breaks it into several configs. Each context
 *
 * @param configString yaml string of kube config
 */
export function loadAndSplitConfig(configString: string): k8s.KubeConfig[] {
  const allConfigs = new k8s.KubeConfig();
  allConfigs.loadFromString(configString);
  return splitConfig(allConfigs);
}

export function dumpConfigYaml(kc: k8s.KubeConfig): string {
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
  return yaml.safeDump(config, {skipInvalid: true});
}

export function podHasIssues(pod: k8s.V1Pod) {
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
export function getNodeWarningConditions(node: k8s.V1Node) {
  return node.status.conditions.filter(c =>
    c.status.toLowerCase() === "true" && c.type !== "Ready" && c.type !== "HostUpgrades"
  )
}
