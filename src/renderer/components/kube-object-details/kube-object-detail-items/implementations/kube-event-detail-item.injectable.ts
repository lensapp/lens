/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { KubeEventDetails } from "../../../+events/kube-event-details";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { isClusterRole } from "./cluster-role-detail-item.injectable";
import { isClusterRoleBinding } from "./cluster-role-binding-detail-item.injectable";
import { isCronJob } from "./cron-job-detail-item.injectable";
import { isDaemonSet } from "./daemon-set-detail-item.injectable";
import { isDeployment } from "./deployment-detail-item.injectable";
import { isEndpoint } from "./endpoints-detail-item.injectable";
import { isHorizontalPodAutoscaler } from "./horizontal-pod-autoscaler-detail-item.injectable";
import { isIngress } from "./ingress-detail-item.injectable";
import { isJob } from "./job-detail-item.injectable";
import { isNetworkPolicy } from "./network-policy-detail-item.injectable";
import { isPersistentVolume } from "./persistent-volume-detail-item.injectable";
import { isPersistentVolumeClaim } from "./persistent-volume-claim-detail-item.injectable";
import { isNode } from "./node-detail-item.injectable";
import { isPod } from "./pod-detail-item.injectable";
import { isReplicaSet } from "./replica-set-detail-item.injectable";
import { isRole } from "./role-detail-item.injectable";
import { isRoleBinding } from "./role-binding-detail-item.injectable";
import { isService } from "./service-detail-item.injectable";
import { isServiceAccount } from "./service-account-detail-item.injectable";
import { isStatefulSet } from "./stateful-set-detail-item.injectable";
import { isStorageClass } from "./storage-class-detail-item.injectable";

const kubeEventDetailItemInjectable = getInjectable({
  id: "kube-event-detail-item",

  instantiate: (di) => {
    const currentKubeObjectInDetails = di.inject(
      currentKubeObjectInDetailsInjectable,
    );

    return {
      Component: KubeEventDetails,

      enabled: computed(() => {
        const kubeObject = currentKubeObjectInDetails.get();

        if (!kubeObject) {
          return false;
        }

        const predicates = [
          isClusterRole,
          isClusterRoleBinding,
          isCronJob,
          isDaemonSet,
          isDeployment,
          isEndpoint,
          isHorizontalPodAutoscaler,
          isIngress,
          isJob,
          isNetworkPolicy,
          isNode,
          isPersistentVolume,
          isPersistentVolumeClaim,
          isPod,
          isReplicaSet,
          isRole,
          isRoleBinding,
          isService,
          isServiceAccount,
          isStatefulSet,
          isStorageClass,
        ];

        return predicates.some((predicate) => predicate(kubeObject));
      }),

      orderNumber: 355,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default kubeEventDetailItemInjectable;
