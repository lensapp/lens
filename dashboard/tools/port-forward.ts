// Get kubernetes services and port-forward them to pods at localhost
// To be used in development only

import * as yargs from "yargs";
import * as concurrently from "concurrently";
import chalk from "chalk";
import { find } from "lodash";
import { execSync } from "child_process";
import { Pod } from "../client/api/endpoints/pods.api";
import { Service } from "../client/api/endpoints/service.api";
import config from "../server/config";

const { LOCAL_SERVER_PORT, WEBPACK_DEV_SERVER_PORT, KUBE_TERMINAL_URL, KUBE_METRICS_URL } = config;
const terminalPort = +KUBE_TERMINAL_URL.match(/\d+$/)[0];
const metricsPort = +KUBE_METRICS_URL.match(/\d+$/)[0];

interface Options {
  namespaces: string[];
  portOverride: Record<string, number>;
  skipServices: string[];
  verbose: boolean;
}

// Configure default options
const { namespaces, portOverride, skipServices, verbose }: Options = yargs.options({
  namespaces: {
    alias: "n",
    describe: "Namespaces to search Services & Pods. Example: --namespaces name1 name2 etc",
    array: true,
    default: [
      "kontena-lens",
      "kontena-stats",
    ],
  },
  verbose: {
    describe: "Show extra logs output. Example: --verbose",
    boolean: true,
  },
  skipServices: {
    alias: "s",
    describe: "Services to skip. Example: --skipServices myService otherName",
    array: true,
    default: [],
  },
  portOverride: {
    alias: "o",
    describe: "Override local ports. Example: --portOverride.serviceName 1000",
    default: {
      "dashboard": terminalPort, // terminal is running in dashboard pod's container
      "rbac-proxy": metricsPort, // replace default "http" port
      "prometheus": metricsPort + 1, // keep available metrics service for testing PromQL results
    }
  },
}).argv;

interface ServiceForward {
  namespace: string;
  serviceName: string;
  podName: string;
  port: number;
  localPort?: number;
}

function getServices(): ServiceForward[] {
  const forwards: ServiceForward[] = [];

  // Search Pod by Service.spec.selector for kubectl port-forward commands
  namespaces.forEach(namespace => {
    const pods = JSON.parse(execSync(`kubectl get pods -n ${namespace} -o json`).toString());
    const services = JSON.parse(execSync(`kubectl get services -n ${namespace} -o json`).toString());

    services.items.forEach((service: Service) => {
      const serviceName = service.metadata.name;
      const port = service.spec?.ports[0].targetPort;
      const podSelector = service.spec.selector;
      const pod: Pod = find(pods.items, {
        metadata: {
          labels: podSelector
        }
      });
      const podName = pod?.metadata?.name || null;
      const localPort = portOverride[serviceName] || port;
      const skipByName = skipServices.includes(serviceName);
      const skipByPort = ["http", WEBPACK_DEV_SERVER_PORT, LOCAL_SERVER_PORT].includes(localPort);
      if (skipByName || skipByPort || !podName) {
        const getReason = (): string => {
          if (skipByName) {
            return "service is excluded in configuration";
          }
          if (skipByPort) {
            return "local port already in use";
          }
          if (!podName) {
            return `pod not found, selector: ${JSON.stringify(podSelector)}`;
          }
          return "";
        };
        console.info(
          chalk.yellow(
            `Skip service: ${chalk.bold(`${namespace}/${serviceName}`)} (${getReason()})`,
            `Ports (local/remote): ${chalk.bold(`${localPort}/${port}`)}`,
            `Pod: ${chalk.bold(podName)}`
          ),
        );
      } else {
        forwards.push({ namespace, serviceName, podName, port, localPort });
      }
    });
  });

  return forwards;
}

// Run
const services = getServices();
const commands = services.map(({ podName, localPort, port, namespace }: ServiceForward) => {
  return `kubectl port-forward -n ${namespace} ${podName} ${localPort}:${port}`;
});
services.forEach(({ serviceName, namespace, podName, port: _port, localPort }, index) => {
  console.log(
    chalk.blueBright.bold(`[${index + 1}] Port-forward`),
    `http://${serviceName}.${namespace}.svc.cluster.local -> http://localhost:${localPort}`,
    `(Pod: ${chalk.bold(podName)})`,
  );
});
if (verbose) {
  console.log(
    chalk.bold.grey('Commands:'),
    chalk.grey(JSON.stringify(commands, null, 2)),
  );
}
concurrently(commands, {
  restartTries: 1000,
  restartDelay: 1000 * 60,
}).catch(Function);
