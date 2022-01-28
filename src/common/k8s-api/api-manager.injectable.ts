/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ClusterStore } from "../../renderer/components/+cluster/store";
import { HorizontalPodAutoscalerStore } from "../../renderer/components/+autoscalers/store";
import { LimitRangeStore } from "../../renderer/components/+limit-ranges/store";
import { ConfigMapStore } from "../../renderer/components/+config-maps/store";
import { PodDisruptionBudgetStore } from "../../renderer/components/+pod-disruption-budgets/store";
import { ResourceQuotaStore } from "../../renderer/components/+resource-quotas/store";
import { SecretStore } from "../../renderer/components/+secrets/store";
import { CustomResourceDefinitionStore } from "../../renderer/components/+custom-resource/store";
import { EventStore } from "../../renderer/components/+events/store";
import { NamespaceStore } from "../../renderer/components/+namespaces/store";
import { EndpointStore } from "../../renderer/components/+endpoints/store";
import { IngressStore } from "../../renderer/components/+ingresses/store";
import { NetworkPolicyStore } from "../../renderer/components/+network-policies/store";
import { ServiceStore } from "../../renderer/components/+services/store";
import { NodeStore } from "../../renderer/components/+nodes/store";
import { PodSecurityPolicyStore } from "../../renderer/components/+pod-security-policies/store";
import { StorageClassStore } from "../../renderer/components/+storage-classes/store";
import { PersistentVolumeClaimStore } from "../../renderer/components/+persistent-volume-claims/store";
import { PersistentVolumeStore } from "../../renderer/components/+persistent-volumes/store";
import { ClusterRoleBindingStore } from "../../renderer/components/+cluster-role-bindings/store";
import { ClusterRoleStore } from "../../renderer/components/+cluster-roles/store";
import { RoleBindingStore } from "../../renderer/components/+role-bindings/store";
import { RoleStore } from "../../renderer/components/+roles/store";
import { ServiceAccountStore } from "../../renderer/components/+service-accounts/store";
import { CronJobStore } from "../../renderer/components/+cronjobs/store";
import { DaemonSetStore } from "../../renderer/components/+daemonsets/store";
import { DeploymentStore } from "../../renderer/components/+deployments/store";
import { JobStore } from "../../renderer/components/+jobs/store";
import { PodStore } from "../../renderer/components/+pods/store";
import { ReplicaSetStore } from "../../renderer/components/+replica-sets/store";
import { StatefulSetStore } from "../../renderer/components/+stateful-sets/store";
import { ApiManager } from "./api-manager";
import { ClusterApi, ClusterRoleApi, ClusterRoleBindingApi, ConfigMapApi, CronJobApi, CustomResourceDefinition, CustomResourceDefinitionApi, DaemonSetApi, DeploymentApi, EndpointApi, EventApi, HorizontalPodAutoscalerApi, IngressApi, JobApi, LimitRangeApi, NamespaceApi, NetworkPolicyApi, NodeApi, PersistentVolumeApi, PersistentVolumeClaimApi, PodApi, PodDisruptionBudgetApi, PodMetricsApi, PodSecurityPolicyApi, ReplicaSetApi, ResourceQuotaApi, RoleApi, RoleBindingApi, SecretApi, SelfSubjectRulesReviewApi, ServiceAccountApi, ServiceApi, StatefulSetApi, StorageClassApi } from "./endpoints";
import { KubeApi } from "./kube-api";
import { KubeObject } from "./kube-object";
import { KubeObjectStore } from "./kube-object.store";

function createAndInit(): ApiManager {
  const apiManager = new ApiManager();

  const clusterApi = new ClusterApi();

  apiManager.registerApi(clusterApi);
  apiManager.registerStore(new ClusterStore(clusterApi));

  const clusterRoleApi = new ClusterRoleApi();

  apiManager.registerApi(clusterRoleApi);
  apiManager.registerStore(new ClusterRoleStore(clusterRoleApi));

  const clusterRoleBindingApi = new ClusterRoleBindingApi();

  apiManager.registerApi(clusterRoleBindingApi);
  apiManager.registerStore(new ClusterRoleBindingStore(clusterRoleBindingApi));

  const configMapApi = new ConfigMapApi();

  apiManager.registerApi(configMapApi);
  apiManager.registerStore(new ConfigMapStore(configMapApi));

  const podApi = new PodApi();
  const podStore = new PodStore(podApi);

  apiManager.registerApi(podApi);
  apiManager.registerStore(podStore);

  const jobApi = new JobApi();
  const jobStore = new JobStore(jobApi, {
    podStore,
  });

  apiManager.registerApi(jobApi);
  apiManager.registerStore(jobStore);

  const cronJobApi = new CronJobApi();

  apiManager.registerApi(cronJobApi);
  apiManager.registerStore(new CronJobStore(cronJobApi, {
    jobStore,
  }));

  const customResourceDefinitionApi = new CustomResourceDefinitionApi();

  apiManager.registerApi(customResourceDefinitionApi);
  apiManager.registerStore(new CustomResourceDefinitionStore(customResourceDefinitionApi, {
    initCustomResourceStore(crd: CustomResourceDefinition) {
      const objectConstructor = class extends KubeObject {
        static readonly kind = crd.getResourceKind();
        static readonly namespaced = crd.isNamespaced();
        static readonly apiBase = crd.getResourceApiBase();
      };

      const api = apiManager.getApi(objectConstructor.apiBase)
        ?? new KubeApi({ objectConstructor });

      if (!apiManager.hasApi(api)) {
        apiManager.registerApi(api);
      }

      if (!apiManager.getStore(api)) {
        apiManager.registerStore(new class extends KubeObjectStore<KubeObject> {
            api = api;
        });
      }
    },
  }));


  const daemonSetApi = new DaemonSetApi();

  apiManager.registerApi(daemonSetApi);
  apiManager.registerStore(new DaemonSetStore(daemonSetApi, {
    podStore,
  }));

  const deploymentApi = new DeploymentApi();

  apiManager.registerApi(deploymentApi);
  apiManager.registerStore(new DeploymentStore(deploymentApi, {
    podStore,
  }));

  const endpointApi = new EndpointApi();

  apiManager.registerApi(endpointApi);
  apiManager.registerStore(new EndpointStore(endpointApi));

  const eventApi = new EventApi();

  apiManager.registerApi(eventApi);
  apiManager.registerStore(new EventStore(eventApi, {
    podStore,
  }));

  const horizontalPodAutoscalerApi = new HorizontalPodAutoscalerApi();

  apiManager.registerApi(horizontalPodAutoscalerApi);
  apiManager.registerStore(new HorizontalPodAutoscalerStore(horizontalPodAutoscalerApi));

  const ingressApi = new IngressApi();

  apiManager.registerApi(ingressApi);
  apiManager.registerStore(new IngressStore(ingressApi));

  const limitRangeApi = new LimitRangeApi();

  apiManager.registerApi(limitRangeApi);
  apiManager.registerStore(new LimitRangeStore(limitRangeApi));

  const namespaceApi = new NamespaceApi();

  apiManager.registerApi(namespaceApi);
  apiManager.registerStore(new NamespaceStore(namespaceApi));

  const networkPolicyApi = new NetworkPolicyApi();

  apiManager.registerApi(networkPolicyApi);
  apiManager.registerStore(new NetworkPolicyStore(networkPolicyApi));

  const nodeApi = new NodeApi();

  apiManager.registerApi(nodeApi);
  apiManager.registerStore(new NodeStore(nodeApi));

  const persistentVolumeApi = new PersistentVolumeApi();
  const persistentVolumeStore = new PersistentVolumeStore(persistentVolumeApi);

  apiManager.registerApi(persistentVolumeApi);
  apiManager.registerStore(persistentVolumeStore);

  const persistentVolumeClaimApi = new PersistentVolumeClaimApi();

  apiManager.registerApi(persistentVolumeClaimApi);
  apiManager.registerStore(new PersistentVolumeClaimStore(persistentVolumeClaimApi));

  const podDisruptionBudgetApi = new PodDisruptionBudgetApi();

  apiManager.registerApi(podDisruptionBudgetApi);
  apiManager.registerStore(new PodDisruptionBudgetStore(podDisruptionBudgetApi));

  const podSecurityPolicyApi = new PodSecurityPolicyApi();

  apiManager.registerApi(podSecurityPolicyApi);
  apiManager.registerStore(new PodSecurityPolicyStore(podSecurityPolicyApi));

  const replicaSetApi = new ReplicaSetApi();

  apiManager.registerApi(replicaSetApi);
  apiManager.registerStore(new ReplicaSetStore(replicaSetApi, {
    podStore,
  }));

  const resourceQuotaApi = new ResourceQuotaApi();

  apiManager.registerApi(resourceQuotaApi);
  apiManager.registerStore(new ResourceQuotaStore(resourceQuotaApi));

  const roleApi = new RoleApi();

  apiManager.registerApi(roleApi);
  apiManager.registerStore(new RoleStore(roleApi));

  const roleBindingApi = new RoleBindingApi();

  apiManager.registerApi(roleBindingApi);
  apiManager.registerStore(new RoleBindingStore(roleBindingApi));

  const secretApi = new SecretApi();

  apiManager.registerApi(secretApi);
  apiManager.registerStore(new SecretStore(secretApi));

  const serviceAccountApi = new ServiceAccountApi();

  apiManager.registerApi(serviceAccountApi);
  apiManager.registerStore(new ServiceAccountStore(serviceAccountApi));

  const serviceApi = new ServiceApi();

  apiManager.registerApi(serviceApi);
  apiManager.registerStore(new ServiceStore(serviceApi));

  const statefulSetApi = new StatefulSetApi();

  apiManager.registerApi(statefulSetApi);
  apiManager.registerStore(new StatefulSetStore(statefulSetApi, {
    podStore,
  }));

  const storageClassApi = new StorageClassApi();

  apiManager.registerApi(storageClassApi);
  apiManager.registerStore(new StorageClassStore(storageClassApi, {
    persistentVolumeStore,
  }));


  // There is no store for these apis, so just register them
  apiManager.registerApi(new PodMetricsApi());
  apiManager.registerApi(new SelfSubjectRulesReviewApi());

  return apiManager;
}

const apiManagerInjectable = getInjectable({
  instantiate: createAndInit,
  lifecycle: lifecycleEnum.singleton,
});

export default apiManagerInjectable;
