import "../common/cluster-ipc";
import type http from "http"
import { autorun } from "mobx";
import { ClusterModel, ClusterStore, clusterStore, getClusterIdFromHost } from "../common/cluster-store"
import { Cluster } from "./cluster"
import logger from "./logger";
import { apiKubePrefix } from "../common/vars";
import { workspaceStore, Workspace } from "../common/workspace-store";
import { userStore, UserStore } from "../common/user-store";
import * as request from "request-promise-native";
import { v4 as uuid } from "uuid";
import {kubeconfig} from '../common/utils/k8sTemplates';
import YAML from 'yaml';
import { readFile } from "fs-extra"
import { getNodeWarningConditions, loadConfig, podHasIssues } from "../common/kube-helpers"
import { customRequestPromise } from "../common/request";
import orderBy from "lodash/orderBy";
import queryString from 'query-string';

const ignoredDECCNamespaces =  [
  'kube-system', 'kube-public', 'openstack-provider-system', 'system',
  'kaas', 'lcm-system', 'istio-system', 'kube-node-lease', 'stacklight'
];

export class DECCManager {
  constructor(protected deccURL: string) {
  }

  async getNamespaces(): Promise<[]> {
    const res = await customRequestPromise({
      uri: `http://${this.deccURL}/api/v1/namespaces`,
      headers: {
        'Authorization': 'Bearer ' + userStore.getTokenDetails().token
      },
      json: true,
      resolveWithFullResponse: true,
      timeout: 10000,
    });
    // logger.info(`getNamespaces: res - ${JSON.stringify(res)}`);
    return res.body;
  }

  async getClustersByNamespace(ns: string): Promise<[]> {
    const res = await customRequestPromise({
      uri: `http://${this.deccURL}/apis/cluster.k8s.io/v1alpha1/namespaces/${ns}/clusters`,
      headers: {
        'Authorization': 'Bearer ' + userStore.getTokenDetails().token
      },
      json: true,
      resolveWithFullResponse: true,
      timeout: 10000,
    });
    // logger.info(`getClustersByNamespace: res - ${JSON.stringify(res)}`);
    return res.body;
  }

  async getK8sToken(): Promise<[]> {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const res = await customRequestPromise({
      uri: `http://${process.env.DECC_URL}/auth/realms/iam/protocol/openid-connect/token`,
      headers: headers,
      method: 'POST', body: queryString.stringify({
        grant_type: 'password',
        response_type: 'id_token',
        scope: 'openid',
        client_id: 'k8s',
        username: `${process.env.DECC_USERNAME}`,
        password: `${process.env.DECC_PASSWORD}`,
      }),
      json: true,
      resolveWithFullResponse: true,
      timeout: 10000,
    });
    // logger.info(`getTokenForCluster: res - ${JSON.stringify(res)}`);
    return res.body;
  }

  async getDECCNamespaces() {
    try {
      const res = await this.getNamespaces();
      // logger.info(`getDECCNamespaces: res - ${JSON.stringify(res)}`);
      var deccNamespaces = [];
      res["items"].forEach(function(namespace) {
        if (!ignoredDECCNamespaces.includes(namespace.metadata.name)) {
          // logger.info(`getDECCNamespaces: Found namespace: ${namespace.metadata.name}`);
          deccNamespaces.push(namespace.metadata.name);
        };
      });
      return deccNamespaces;

    } catch (err) {
      logger.error(`getDECCNamespaces: ${String(err)}`);
    }
  }

  getDECCNamespacesForUser(deccNamespaces, userIAMRoles: string[], username: string) {
    var deccNamespacesForUser = [];
    deccNamespaces.forEach(function(ns) {
      if (userIAMRoles.includes(`m:kaas:${ns}@reader`) || userIAMRoles.includes(`m:kaas:${ns}@writer`)) {
        // add namespace to workspaceStore if not present
        //logger.info(`getDECCNamespacesForUser: User ${username} has access to namespace ${ns}`);
        deccNamespacesForUser.push(ns);
      }
    });
    return deccNamespacesForUser;
  }

  async getDECCClustersForNamespace(ns: string) {
    try {
      const res = await this.getClustersByNamespace(ns);
      //logger.info(`getDECCClustersForNamespace: res - ${JSON.stringify(res)}`);

      var deccClustersForNamespace = [];
        //API call ok....
        res["items"].forEach(function(deccCluster) {
          deccClustersForNamespace.push(deccCluster);
        });
        return deccClustersForNamespace;
    } catch(err) {
      logger.error(`getDECCClustersForNamespace: ${String(err)}`);
    }
  }

  async getK8sTokenForUser() {
    try {
      const res = await this.getK8sToken();
      return res;
    } catch(err) {
      logger.error(`getK8sTokenForUser: ${String(err)}`);
    }
  }

  addLensDECCWorkspace(ws: string) {
    const wsPrefix = `decc`;

    if (!workspaceStore.getByName(`${wsPrefix}-${ws}`)) {
      workspaceStore.saveWorkspace({id: uuid(), name: `${wsPrefix}-${ws}`, description: `DECC Namespace: ${ws}`});
      logger.info(`Added new workspace: ${wsPrefix}-${ws}`);
    }
  }

  addLensClusterToDECCWorkspace(deccCluster, idToken: string, refreshToken: string, username: string, workspace: Workspace, k8sToken) {
    // check if cluster is already in the cluster store
    var clusterPresent = false;
    const clusterPrefix = `decc`

    clusterStore.getByWorkspaceId(workspace.id).forEach(cluster => {
      if (cluster.preferences.clusterName === `${clusterPrefix}-${deccCluster.metadata.name}`) {
        clusterPresent = true;
      }
    });

    if ("status" in deccCluster && !clusterPresent) {
      let ucpDashboard = `https://${deccCluster.status.providerStatus.ucpDashboard.split(":", 2).reverse()[0].substring(2)}:443`;
      //logger.info(`addLensClusterToDECCWorkspace: ucpDashboard - ${ucpDashboard}`);

      //let clusterToken = this.getTokenForCluster(deccCluster.metadata.uid);
      //logger.info(`addLensClusterToDECCWorkspace: clusterToken - ${clusterToken}`);

      // let parsedClusterIdToken = userStore.decodeToken(k8sToken["id_token"]);
      // logger.info(`addLensClusterToDECCWorkspace: parsedClusterToken - ${parsedClusterIdToken}`);

      const idTokenToUse = `${clusterPrefix}-${deccCluster.metadata.name}` === "decc-kaas-mgmt" ? idToken : k8sToken["id_token"]
      const refreshTokenToUse = `${clusterPrefix}-${deccCluster.metadata.name}` === "decc-kaas-mgmt" ? refreshToken : k8sToken["refresh_token"]

      const jsConfig = kubeconfig({
        username: username,
        clusterName: `${clusterPrefix}-${deccCluster.metadata.name}`,
        clientId: deccCluster.status.providerStatus.oidc.clientId,
        idpCertificateAuthorityData: deccCluster.status.providerStatus.oidc.certificate,
        idpIssuerUrl: deccCluster.status.providerStatus.oidc.issuerUrl,
        server: ucpDashboard,
        apiCertificate: deccCluster.status.providerStatus.apiServerCertificate,
        idToken: idTokenToUse,
        refreshToken: refreshTokenToUse
      });

      //console.log(`Generated kubeconfig: ${YAML.stringify(jsConfig)}`)

      let newClusters: ClusterModel[] = [];

      let newCluster: ClusterModel = {
        id: deccCluster.metadata.uid,
        contextName: `${username}@${clusterPrefix}-${deccCluster.metadata.name}`,
        preferences: {
          clusterName: `${clusterPrefix}-${deccCluster.metadata.name}`,
          httpsProxy: undefined,
        },
        kubeConfigPath: ClusterStore.embedCustomKubeConfig(deccCluster.metadata.uid, YAML.stringify(jsConfig)),
        workspace: workspace.id,
      };
      
      newClusters.push(newCluster);
      clusterStore.addCluster(...newClusters);
     
      let createdCluster = clusterStore.getById(newCluster.id);
      createdCluster.pushState();
      clusterStore.load();

      // clusterStore.setActive(newCluster.id);
      logger.info(`addLensClusterToDECCWorkspace: Created Cluster Name: ${createdCluster.preferences.clusterName}, Cluster UCP Dashboard URL: ${ucpDashboard}`);
    };
  }

  addLensClustersToDECCWorkspace(deccClusters, idToken: string, refreshToken: string, username: string, wsName: string, k8sToken) {
    const wsPrefix = `decc`;
    const workspace = workspaceStore.getByName(`${wsPrefix}-${wsName}`);

    //logger.info(`addLensClustersToDECCWorkspace: Processing clusters in Workspace ${workspace.name} for User ${username}`);

    deccClusters.forEach(cluster => { 
      this.addLensClusterToDECCWorkspace(cluster, idToken, refreshToken, username, workspace, k8sToken)
    });
  }

  deleteLensDECCClustersByWorkspace(ws) {
    logger.info(`deleteLensDECCClustersByWorkspace: Removing all Lens DECC clusters for Workspace ${ws.name}`)
    clusterStore.removeByWorkspaceId(ws.id);
  }

  deleteLensDECCWorkspace(workspaceId) {
    workspaceStore.removeWorkspace(workspaceId);
  }

  deleteLensDECCWorkspaces(userDECCNamespaces) {
    const wsPrefix = `decc`;
    workspaceStore.workspacesList.forEach(ws => {
      let strippedPrefixWorkspaceName = ws.name.slice(5);
      //logger.info(`deleteLensDECCWorkspaces: Existing Workspace ${ws.name} being checked against ${userDECCNamespaces.toString()}`) 
      if (ws.name != "default") {
        //logger.info(`deleteLensDECCWorkspaces: Stripped Workspace ${strippedPrefixWorkspaceName} being checked against ${userDECCNamespaces.toString()}`) 
        if (!userDECCNamespaces.includes(`${strippedPrefixWorkspaceName}`)) {
          logger.info(`deleteLensDECCWorkspaces: User does not have access to existing Workspace ${ws.name} - Deleting`)
          this.deleteLensDECCClustersByWorkspace(ws);
          this.deleteLensDECCWorkspace(ws.id);
        }
      }
    }); 
  }

  refreshLensDECCClusterKubeconfigs(idToken:string , refreshToken: string, username: string, workspace: string, k8sToken) {
    //logger.info(`refreshLensDECCClusterKubeconfigs: Processing Workspace Name ${workspace}`);
    const wsPrefix = `decc`;
    const ws = workspaceStore.getByName(`${wsPrefix}-${workspace}`);

    if (ws === undefined) { return }

    //logger.info(`refreshLensDECCClusterKubeconfigs: Processing Workspace ${JSON.stringify(ws)}`)
    clusterStore.getByWorkspaceId(ws.id).forEach(cluster => {
      const idTokenToUse = cluster.preferences.clusterName === "decc-kaas-mgmt" ? idToken : k8sToken["id_token"]
      const refreshTokenToUse = cluster.preferences.clusterName === "decc-kaas-mgmt" ? refreshToken : k8sToken["refresh_token"]
      const currentKubeConfig = loadConfig(cluster.kubeConfigPath); //readFile(cluster.kubeConfigPath, "utf8");
      // console.log(`refreshClusterKubeConfigs: Read kubeconfig from file: ${cluster.kubeConfigPath}. Contents: ${YAML.stringify(kubeConfig)}`);
      // console.log(`refreshClusterKubeConfigs: kubeconfig users[0]: ${YAML.stringify(kubeConfig.users[0])}`);
      // console.log(`refreshClusterKubeConfigs: kubeconfig users[0] id-token: ${YAML.stringify(kubeConfig.users[0].authProvider.config["id-token"])}`);
      // console.log(`refreshClusterKubeConfigs: kubeconfig users[0] refresh-token: ${YAML.stringify(kubeConfig.users[0].authProvider.config["refresh-token"])}`);
      const jsConfig = kubeconfig({
        username: username,
        clusterName: currentKubeConfig.clusters[0].name,
        clientId: currentKubeConfig.users[0].authProvider.config["client-id"],
        idpCertificateAuthorityData: currentKubeConfig.users[0].authProvider.config["idp-certificate-authority-data"],
        idpIssuerUrl: currentKubeConfig.users[0].authProvider.config["idp-issuer-url"],
        server: currentKubeConfig.clusters[0].server,
        apiCertificate: currentKubeConfig.clusters[0].caData,
        idToken: idTokenToUse,
        refreshToken: refreshTokenToUse
      });

      cluster.contextName = `${username}@${currentKubeConfig.clusters[0].name}`;
      ClusterStore.embedCustomKubeConfig(cluster.id, YAML.stringify(jsConfig));
      logger.info(`refreshLensDECCClusterKubeconfigs: Updated Cluster ${cluster.preferences.clusterName} kubeconfig with new token values`);
      cluster.refresh();
    });
  }

  async createDECCLensEnv() {
    const idToken = userStore.token.token; 
    const parsedIdToken = userStore.decodeToken (userStore.token.token);
    const refreshToken = userStore.token.refreshToken;
    const username = parsedIdToken.preferred_username;
    const userIAMRoles = parsedIdToken.iam_roles;

    // get the token from the k8s client for this user
    const k8sToken = await this.getK8sTokenForUser();

    // get all available DECC Namespaces
    const deccNamespaces = await this.getDECCNamespaces();
    // logger.info(`createDECCLensEnv: The following namespaces exist in DECC - ${deccNamespaces.toString()}`);

    // get all DECC Namespaces the user has access to
    const userDECCNamespaces: string[] = await this.getDECCNamespacesForUser(deccNamespaces, userIAMRoles, username);
    if (userDECCNamespaces.length > 0) {
      userDECCNamespaces.sort(); 
      logger.info(`createDECCLensEnv: The following namespaces exist in DECC for User ${username} - ${userDECCNamespaces.toString()}`);

      // lets remove workspaces this user does not have access to
      this.deleteLensDECCWorkspaces(userDECCNamespaces);

      userDECCNamespaces.forEach(async (ns) => {
        try {
          let deccClustersByNamespace = await this.getDECCClustersForNamespace(ns);
          //logger.info(`createDECCLensEnv: The following clusters exist in Namespace ${ns} - ${JSON.stringify(deccClustersByNamespace)}`);

          // refresh tokens for any existing clusters
          this.refreshLensDECCClusterKubeconfigs(idToken, refreshToken, username, ns, k8sToken);
           
          // now lets add the workspace in Lens
          this.addLensDECCWorkspace(ns);

          // now lets add the clusters to the workspace
          this.addLensClustersToDECCWorkspace(deccClustersByNamespace, idToken, refreshToken, username, ns, k8sToken);

        } catch (err) {
          logger.error(`createDECCLensEnv: ${String(err)}`); 
        }
      });
    }
  }
}
