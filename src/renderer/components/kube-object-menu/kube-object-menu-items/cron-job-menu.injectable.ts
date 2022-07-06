/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectMenuItemInjectionToken } from "../kube-object-menu-item-injection-token";
import { computed } from "mobx";
import { CronJobMenu } from "../../+workloads-cronjobs/cron-job-menu";

const cronJobMenuInjectable = getInjectable({
  id: "cron-job-menu-kube-object-menu",

  instantiate: () => (  {
    kind: "CronJob",
    apiVersions: ["batch/v1beta1"],
    Component: CronJobMenu,
    enabled: computed(() => true),
    orderNumber: 20,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default cronJobMenuInjectable;
