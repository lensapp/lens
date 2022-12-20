/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// NOTE: this file is not currently exported as part of `Common`, but should be.
//       It is here to consolidate the common parts which are exported to `Main`
//       and to `Renderer`

import apiManagerInjectable from "../../common/k8s-api/api-manager/manager.injectable";
import createKubeApiForClusterInjectable from "../../common/k8s-api/create-kube-api-for-cluster.injectable";
import createKubeApiForRemoteClusterInjectable from "../../common/k8s-api/create-kube-api-for-remote-cluster.injectable";
import createResourceStackInjectable from "../../common/k8s/create-resource-stack.injectable";
import type { ResourceApplyingStack } from "../../common/k8s/resource-stack";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import type { KubernetesCluster } from "./catalog";
import type { KubeApiDataFrom, KubeObjectStoreOptions } from "../../common/k8s-api/kube-object.store";
import { KubeObjectStore as InternalKubeObjectStore } from "../../common/k8s-api/kube-object.store";
import type { KubeJsonApiDataFor, KubeObject } from "../../common/k8s-api/kube-object";
import type { KubeApi } from "../../common/k8s-api/kube-api";
import clusterFrameContextForNamespacedResourcesInjectable from "../../renderer/cluster-frame-context/for-namespaced-resources.injectable";
import type { ClusterContext } from "../../renderer/cluster-frame-context/cluster-frame-context";

export const apiManager = asLegacyGlobalForExtensionApi(apiManagerInjectable);
export const forCluster = asLegacyGlobalFunctionForExtensionApi(createKubeApiForClusterInjectable);
export const forRemoteCluster = asLegacyGlobalFunctionForExtensionApi(createKubeApiForRemoteClusterInjectable);

export { KubeApi } from "../../common/k8s-api/kube-api";

export const createResourceStack = asLegacyGlobalFunctionForExtensionApi(createResourceStackInjectable);

/**
 * @deprecated Switch to using `Common.createResourceStack` instead
 */
export class ResourceStack implements ResourceApplyingStack {
  private readonly impl: ResourceApplyingStack;

  constructor(cluster: KubernetesCluster, name: string) {
    this.impl = createResourceStack(cluster, name);
  }

  kubectlApplyFolder(folderPath: string, templateContext?: any, extraArgs?: string[] | undefined): Promise<string> {
    return this.impl.kubectlApplyFolder(folderPath, templateContext, extraArgs);
  }

  kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[] | undefined): Promise<string> {
    return this.impl.kubectlDeleteFolder(folderPath, templateContext, extraArgs);
  }
}

/**
 * @deprecated This type is unused
 */
export interface IKubeApiCluster {
  metadata: {
    uid: string;
  };
}

export type { CreateKubeApiForRemoteClusterConfig as IRemoteKubeApiConfig } from "../../common/k8s-api/create-kube-api-for-remote-cluster.injectable";
export type { CreateKubeApiForLocalClusterConfig as ILocalKubeApiConfig } from "../../common/k8s-api/create-kube-api-for-cluster.injectable";

export {
  KubeObject,
  KubeStatus,
  type OwnerReference,
  type KubeObjectMetadata,
  type NamespaceScopedMetadata,
  type ClusterScopedMetadata,
  type BaseKubeJsonApiObjectMetadata,
  type KubeJsonApiObjectMetadata,
  type KubeStatusData,
} from "../../common/k8s-api/kube-object";

export {
  KubeJsonApi,
  type KubeJsonApiData,
} from "../../common/k8s-api/kube-json-api";

export abstract class KubeObjectStore<
  K extends KubeObject = KubeObject,
  A extends KubeApi<K, D> = KubeApi<K, KubeJsonApiDataFor<K>>,
  D extends KubeJsonApiDataFor<K> = KubeApiDataFrom<K, A>,
> extends InternalKubeObjectStore<K, A, D> {
  /**
   * @deprecated This is no longer used and shouldn't have been every really used
   */
  static readonly context = {
    set: (ctx: ClusterContext) => {
      console.warn("Setting KubeObjectStore.context is no longer supported");
      void ctx;
    },
    get: () => asLegacyGlobalForExtensionApi(clusterFrameContextForNamespacedResourcesInjectable),
  };

  get context() {
    return this.dependencies.context;
  }

  constructor(api: A, opts?: KubeObjectStoreOptions);
  /**
   * @deprecated Supply API instance through constructor
   */
  constructor();
  constructor(api?: A, opts?: KubeObjectStoreOptions) {
    super(
      {
        context: asLegacyGlobalForExtensionApi(clusterFrameContextForNamespacedResourcesInjectable),
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      api!,
      opts,
    );
  }
}

export {
  type JsonPatch,
  type KubeObjectStoreLoadAllParams,
  type KubeObjectStoreLoadingParams,
  type KubeObjectStoreSubscribeParams,
} from "../../common/k8s-api/kube-object.store";

export {
  type Container as IPodContainer,
  type PodContainerStatus as IPodContainerStatus,
  Pod,
  PodApi as PodsApi,
  Node,
  NodeApi as NodesApi,
  Deployment,
  DeploymentApi,
  DaemonSet,
  StatefulSet,
  Job,
  CronJob,
  ConfigMap,
  type SecretReference as ISecretRef,
  Secret,
  ReplicaSet,
  ResourceQuota,
  LimitRange,
  HorizontalPodAutoscaler,
  PodDisruptionBudget,
  PriorityClass,
  Service,
  Endpoints as Endpoint,
  Ingress, IngressApi,
  NetworkPolicy,
  PersistentVolume,
  PersistentVolumeClaim,
  PersistentVolumeClaimApi as PersistentVolumeClaimsApi,
  StorageClass,
  Namespace,
  KubeEvent,
  ServiceAccount,
  Role,
  RoleBinding,
  ClusterRole,
  ClusterRoleBinding,
  CustomResourceDefinition,
} from "../../common/k8s-api/endpoints";
