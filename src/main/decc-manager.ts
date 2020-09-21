import "../common/cluster-ipc";
import type http from "http"
import { autorun } from "mobx";
import { ClusterStore, clusterStore, getClusterIdFromHost } from "../common/cluster-store"
import { Cluster } from "./cluster"
import logger from "./logger";
import { apiKubePrefix } from "../common/vars";
import { workspaceStore, Workspace } from "../common/workspace-store";
import { userStore } from "../common/user-store";
import * as request from "request-promise-native";
import { v4 as uuid } from "uuid";
import {kubeconfig} from '../common/utils/k8sTemplates';
import YAML from 'yaml';

const ignoredDECCNamespaces =  [
  'kube-system', 'kube-public', 'openstack-provider-system', 'system',
  'kaas', 'lcm-system', 'istio-system', 'kube-node-lease', 'stacklight'
];

export class DECCManager {
  constructor(protected keycloakServer: http.Server, protected deccURL: string) {
  }
    // auto-init clusters
  //   autorun(() => {
  //     clusterStore.clusters.forEach(cluster => {
  //       if (!cluster.initialized) {
  //         logger.info(`[CLUSTER-MANAGER]: init cluster`, cluster.getMeta());
  //         cluster.init(port);
  //       }
  //     });
  //   });

  //   // auto-stop removed clusters
  //   autorun(() => {
  //     const removedClusters = Array.from(clusterStore.removedClusters.values());
  //     if (removedClusters.length > 0) {
  //       const meta = removedClusters.map(cluster => cluster.getMeta());
  //       logger.info(`[CLUSTER-MANAGER]: removing clusters`, meta);
  //       removedClusters.forEach(cluster => cluster.disconnect());
  //       clusterStore.removedClusters.clear();
  //     }
  //   }, {
  //     delay: 250
  //   });
  // }

  getNamespacesForUser() {
    var namespacesUserCanAccess: Array<Workspace> = workspaceStore.workspacesList;
    var parsedToken = userStore.decodeToken (userStore.getTokenDetails().token);

    // get all namespaces this id has access to
    const namespaces = {
      method: 'GET',
      url: `http://${this.deccURL}/api/v1/namespaces`,
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

      return namespacesUserCanAccess;
    })
    .catch(function (err) {
      // API call failed...
      console.log(err);
    });
  }

  addClustersToWorkspace() {
    var parsedToken = userStore.decodeToken (userStore.getTokenDetails().token);
    console.log(`deccURL: ${this.deccURL}`);

    workspaceStore.workspacesList.forEach(function(ws) {
      console.log(`Adding clusters for ws: ${ws.name}`);
      let clusters = {
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
              idToken: userStore.getTokenDetails().token,
              refreshToken: userStore.getTokenDetails().refreshToken
            });
  
            console.log(`Generated kubeconfig: ${YAML.stringify(jsConfig)}`)
  
            console.log(`Cluster Name: ${deccCluster.metadata.name}, Cluster UCP Dashboard URL: ${deccCluster.status.providerStatus.ucpDashboard}`)
            let newCluster = new Cluster({
              id: uuid(),
              contextName: `${parsedToken.preferred_username}@${deccCluster.metadata.name}`,
              preferences: {
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
  }
}
