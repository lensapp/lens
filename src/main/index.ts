// Main process

import "../common/system-ca"
import "../common/prometheus-providers"
import { app, dialog } from "electron"
import { appName } from "../common/vars";
import path from "path"
import { LensProxy } from "./lens-proxy"
import { WindowManager } from "./window-manager";
import { ClusterManager } from "./cluster-manager";
import AppUpdater from "./app-updater"
import { shellSync } from "./shell-sync"
import { getFreePort } from "./port"
import { mangleProxyEnv } from "./proxy-env"
import { registerFileProtocol } from "../common/register-protocol";
import { ClusterStore, clusterStore } from "../common/cluster-store"
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { tracker } from "../common/tracker";
import logger from "./logger"
import * as fs from 'fs';
import * as http from "http";
import * as request from "request-promise-native";
import { uniqueId } from "lodash";
import { v4 as uuid } from "uuid";
import { Cluster } from "../main/cluster";
import {kubeconfig} from '../common/utils/k8sTemplates';
import YAML from 'yaml'

const workingDir = path.join(app.getPath("appData"), appName);
app.setName(appName);
if (!process.env.CICD) {
  app.setPath("userData", workingDir);
}

let windowManager: WindowManager;
let clusterManager: ClusterManager;
let proxyServer: LensProxy;
//let clusterStore: ClusterStore;

mangleProxyEnv()
if (app.commandLine.getSwitchValue("proxy-server") !== "") {
  process.env.HTTPS_PROXY = app.commandLine.getSwitchValue("proxy-server")
}

const keycloakWinURL = process.env.NODE_ENV === 'development'
? `http://localhost:3000/keycloak_index.html`
: `file://${__static}/keycloak_index.html`
const { ipcMain } = require('electron')

const ignoredDECCNamespaces =  [
  'kube-system', 'kube-public', 'openstack-provider-system', 'system',
  'kaas', 'lcm-system', 'istio-system', 'kube-node-lease', 'stacklight'
];

async function main() {
  await shellSync();
  logger.info(`🚀 Starting Lens from "${workingDir}"`)

  tracker.event("app", "start");
  const updater = new AppUpdater()
  updater.start();

  registerFileProtocol("static", __static);

  // find free port
  let proxyPort: number
  try {
    proxyPort = await getFreePort()
  } catch (error) {
    logger.error(error)
    dialog.showErrorBox("Lens Error", "Could not find a free port for the cluster proxy")
    app.quit();
  }

  // preload configuration from stores
  await Promise.all([
    userStore.load(),
    clusterStore.load(),
    workspaceStore.load(),
  ]);

  // create cluster manager
  clusterManager = new ClusterManager(proxyPort);

  // run proxy
  try {
    proxyServer = LensProxy.create(proxyPort, clusterManager);
  } catch (error) {
    logger.error(`Could not start proxy (127.0.0:${proxyPort}): ${error.message}`)
    dialog.showErrorBox("Lens Error", `Could not start proxy (127.0.0:${proxyPort}): ${error.message || "unknown error"}`)
    app.quit();
  }

  //start renderer with keycloak login page
  const keycloakServer = http.createServer(function(req: http.IncomingMessage, res: http.ServerResponse) {
    res.writeHead(200, {"Content-Type": "text/html"});  
    var readSream = fs.createReadStream(__static + '/keycloak_index.html','utf8')
    readSream.pipe(res);
  }).listen(3000);

  // create window manager and open app
  windowManager = new WindowManager(proxyPort, 3000);
  //windowManager = new WindowManager(3000);

  //open login page in keyloak renderer
  // if (isDevelopment) {
  //   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  //   app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
  //   app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
  // }

  // SSL/TSL: this is the self signed certificate support
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    console.log('cert error: ' + error);
    event.preventDefault();
    callback(true);
  });

  //windowManager.showMain(keycloakWinURL);
}

app.on("ready", main);

app.on("will-quit", async (event) => {
  event.preventDefault(); // To allow mixpanel sending to be executed
  if (proxyServer) proxyServer.close()
  if (clusterManager) clusterManager.stop()
  app.exit();
})

ipcMain.on('keycloak-token', (event, idToken, refreshToken) => {
  logger.info('test keycloak close main win');
  userStore.setTokenDetails(idToken, refreshToken);
  logger.info('saved id token and refreshToken to userStore');

  logger.info('the idToken is: ' + userStore.getTokenDetails().token);

  var parsedToken = userStore.decodeToken (idToken);

  var namespacesUserCanAccess: string[] = workspaceStore.workspacesList;

  // get all namespaces this id has access to
  const namespaces = {
    method: 'GET',
    url: 'http://a09bfce9ea3074e25b8e5e7b1df576fd-1162277427.eu-west-2.elb.amazonaws.com/api/v1/namespaces',
    headers: {
      'Authorization': 'Bearer ' + userStore.getTokenDetails().token
    },
    json: true
  };

  request(namespaces)
  .then(function(response) {
      //API call ok....
      const deccNamespaces = response["items"]; 
      // logger.info(JSON.stringify(deccNamespaces));
      
      deccNamespaces.forEach(function(namespace) {
        if (!ignoredDECCNamespaces.includes(namespace.metadata.name)) {
            // console.log("Namespace Name: " + namespace.metadata.name);
            let ns = namespace.metadata.name;
            //console.log("parsedToken.iam_roles: ", parsedToken.iam_roles);
            if (parsedToken.iam_roles.includes(`m:kaas:${ns}@reader`) || parsedToken.iam_roles.includes(`m:kaas:${ns}@writer`)) {
                // add namespace to workspaceStore if not present
                console.log(`User: ${parsedToken.preferred_username} has access to namespace: ${ns}`);
                if (!workspaceStore.getByName(ns)) {
                  workspaceStore.saveWorkspace({id: uuid(), name: ns, description: `DECC Namespace: ${ns}`});
                  console.log(`Added new workspace: ${ns}`);
                  namespacesUserCanAccess.push(ns);
                }
            };
        };
      });
  })
  .catch(function (err) {
    // API call failed...
    console.log(err);
  });

  // now lets add the clusters for each namespace
  workspaceStore.workspacesList.forEach(function(ws) {
    console.log(`Adding clusters for ws: ${ws.name}`);
    var clusters = {
      method: 'GET',
      url: `http://a09bfce9ea3074e25b8e5e7b1df576fd-1162277427.eu-west-2.elb.amazonaws.com/apis/cluster.k8s.io/v1alpha1/namespaces/${ws.name}/clusters`,
      headers: {
        'Authorization': 'Bearer ' + userStore.getTokenDetails().token
      },
      json: true
    };

    request(clusters)
    .then(function(response) {
      //API call ok....
      const deccClusters = response["items"];
      deccClusters.forEach(function(deccCluster: object) {
        // check if cluster is already in the cluster store
        let clusterPresent = false;
        clusterStore.getByWorkspaceId(ws.id).forEach(wsCluster => {
          if (wsCluster.contextName === `${parsedToken.preferred_username}@${deccCluster.metadata.name}`) {
            clusterPresent = true;
          }
        });

        if ("status" in deccCluster && !clusterPresent) {
          // clusterUCPURL = cluster.status.

          let ucpDashboard = `https://${deccCluster.status.providerStatus.ucpDashboard.split(":", 2).reverse()[0].substring(2)}:443`;
          console.log (`ucpDashboard: ${ucpDashboard}`);

          const jsConfig = kubeconfig({
            username: parsedToken.preferred_username,
            clusterName: deccCluster.metadata.name,
            clientId: deccCluster.status.providerStatus.oidc.clientId,
            idpCertificateAuthorityData: deccCluster.status.providerStatus.oidc.certificate,
            idpIssuerUrl: deccCluster.status.providerStatus.oidc.issuerUrl,
            server: ucpDashboard,
            apiCertificate: deccCluster.status.providerStatus.apiServerCertificate,
            idToken: idToken,
            refreshToken: refreshToken
          });

          console.log(`Generated kubeconfig: ${YAML.stringify(jsConfig)}`)

          console.log(`Cluster Name: ${deccCluster.metadata.name}, Cluster UCP Dashboard URL: ${deccCluster.status.providerStatus.ucpDashboard}`)
          let newCluster = new Cluster({
            id: uuid(),
            contextName: `${parsedToken.preferred_username}@${deccCluster.metadata.name}`,
            preferences: {
              // icon: "data:;base64,iVBORw0KGgoAAAANSUhEUgAAA1wAAAKoCAYAAABjkf5",
              clusterName: deccCluster.metadata.name,
              httpsProxy: undefined,
            },
            kubeConfigPath: ClusterStore.embedCustomKubeConfig(deccCluster.metadata.uid, YAML.stringify(jsConfig)),
            workspace: ws.name,
          });

          clusterStore.addCluster(newCluster);
        };
      }); 
    })
    .catch(function (err: string) {
      // API call failed...
      console.log(err);
    });
  });
  
  //TODO: Use vmURL instead of hardcoded localhost:9080 here
//   const winURL = process.env.NODE_ENV === 'development'
// ? `http://localhost:9080?token=${token}`
// : `file://${__dirname}/index.html?token=${token}`
 
  //TODO: refresh token! 
  windowManager.showMain();
});

ipcMain.on('keycloak-token-update', (event, token) => {
  logger.error('token refresh receivied:' + token);
  //TODO: handle refresh token! 
});

ipcMain.on('keycloak-logout', (event, data) => {
  logger.error('logout');
  windowManager.showKeycloak();
});
