/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterDependencies } from "../../common/cluster/cluster";
import { Cluster } from "../../common/cluster/cluster";
import directoryForKubeConfigsInjectable from "../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import createKubeconfigManagerInjectable from "../kubeconfig-manager/create-kubeconfig-manager.injectable";
import createKubectlInjectable from "../kubectl/create-kubectl.injectable";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import createAuthorizationReviewInjectable from "../../common/cluster/create-authorization-review.injectable";
import listNamespacesInjectable from "../../common/cluster/list-namespaces.injectable";
import createListApiResourcesInjectable from "../cluster/request-api-resources.injectable";
import loggerInjectable from "../../common/logger.injectable";
import broadcastMessageInjectable from "../../common/ipc/broadcast-message.injectable";
import loadConfigfromFileInjectable from "../../common/kube-helpers/load-config-from-file.injectable";
import requestNamespaceListPermissionsForInjectable from "../../common/cluster/request-namespace-list-permissions.injectable";
import clusterVersionDetectorInjectable from "../cluster-detectors/cluster-version-detector.injectable";
import detectClusterMetadataInjectable from "../cluster-detectors/detect-cluster-metadata.injectable";

const createClusterInjectable = getInjectable({
  id: "create-cluster",

  instantiate: (di) => {
    const dependencies: ClusterDependencies = {
      directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
      createKubeconfigManager: di.inject(createKubeconfigManagerInjectable),
      createKubectl: di.inject(createKubectlInjectable),
      createContextHandler: di.inject(createContextHandlerInjectable),
      createAuthorizationReview: di.inject(createAuthorizationReviewInjectable),
      requestNamespaceListPermissionsFor: di.inject(requestNamespaceListPermissionsForInjectable),
      requestApiResources: di.inject(createListApiResourcesInjectable),
      createListNamespaces: di.inject(listNamespacesInjectable),
      logger: di.inject(loggerInjectable),
      broadcastMessage: di.inject(broadcastMessageInjectable),
      loadConfigfromFile: di.inject(loadConfigfromFileInjectable),
      clusterVersionDetector: di.inject(clusterVersionDetectorInjectable),
      detectClusterMetadata: di.inject(detectClusterMetadataInjectable),
    };

    return (model, configData) => new Cluster(dependencies, model, configData);
  },

  injectionToken: createClusterInjectionToken,
});

export default createClusterInjectable;
