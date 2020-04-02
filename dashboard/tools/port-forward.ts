// Get kubernetes services and port-forward them to pods at localhost
// To be used in development only

import * as yargs from "yargs"
import * as concurrently from "concurrently"
import chalk from "chalk";
import { find } from "lodash"
import { execSync } from "child_process"
import { Pod } from "../client/api/endpoints/pods.api";
import { Service } from "../client/api/endpoints/service.api";
import config from "../server/config";

var { LOCAL_SERVER_PORT, WEBPACK_DEV_SERVER_PORT, KUBE_TERMINAL_URL, KUBE_METRICS_URL } = config;
var terminalPort = +KUBE_TERMINAL_URL.match(/\d+$/)[0];
var metricsPort = +KUBE_METRICS_URL.match(/\d+$/)[0];

// Configure default options
var { namespaces, portOverride, skipServices, verbose } = yargs.options({
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

interface IServiceForward {
  namespace: string;
  serviceName: string;
  podName: string;
  port: number;
  localPort?: number;
}

function getServices() {
  var forwards: IServiceForward[] = [];

  // Search Pod by Service.spec.selector for kubectl port-forward commands
  namespaces.forEach(namespace => {
    var pods = JSON.parse(execSync(`kubectl get pods -n ${namespace} -o json`).toString());
    var services = JSON.parse(execSync(`kubectl get services -n ${namespace} -o json`).toString());

    services.items.forEach((service: Service) => {
      var serviceName = service.metadata.name;
      var port = service.spec.ports && service.spec.ports[0].targetPort;
      var podSelector = service.spec.selector;
      var pod: Pod = find(pods.items, {
        metadata: {
          labels: podSelector
        }
      });
      var podName = pod ? pod.metadata.name : null;
      var localPort = portOverride[serviceName] || port;
      var skipByName = skipServices.includes(serviceName);
      var skipByPort = ["http", WEBPACK_DEV_SERVER_PORT, LOCAL_SERVER_PORT].includes(localPort);
      if (skipByName || skipByPort || !podName) {
        var getReason = () => {
          if (skipByName) return "service is excluded in configuration"
          if (skipByPort) return "local port already in use"
          if (!podName) return `pod not found, selector: ${JSON.stringify(podSelector)}`
        };
        console.info(
          chalk.yellow(
            `Skip service: ${chalk.bold(`${namespace}/${serviceName}`)} (${getReason()})`,
            `Ports (local/remote): ${chalk.bold(`${localPort}/${port}`)}`,
            `Pod: ${chalk.bold(podName)}`
          ),
        )
      }
      else {
        forwards.push({
          namespace, serviceName, podName,
          port, localPort,
        });
      }
    });
  });

  return forwards;
}

// Run
var services = getServices();
var commands = services.map(({ podName, localPort, port, namespace }: IServiceForward) => {
  return `kubectl port-forward -n ${namespace} ${podName} ${localPort}:${port}`
});
services.forEach(({ serviceName, namespace, podName, port, localPort }, index) => {
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
