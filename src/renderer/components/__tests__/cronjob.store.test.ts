/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { CronJobStore } from "../+workloads-cronjobs/store";
import cronJobStoreInjectable from "../+workloads-cronjobs/store.injectable";
import { CronJob } from "../../../common/k8s-api/endpoints";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";

const scheduledCronJob = new CronJob({
  apiVersion: "foo",
  kind: "CronJob",
  metadata: {
    name: "scheduledCronJob",
    resourceVersion: "scheduledCronJob",
    uid: "scheduledCronJob",
    namespace: "default",
    selfLink: "/apis/batch/v1beta1/cronjobs/default/scheduledCronJob",
  },
  spec: {
    schedule: "test",
    concurrencyPolicy: "test",
    suspend: false,
    jobTemplate: {
      metadata: {},
      spec: {
        template: {
          metadata: {},
          spec: {
            containers: [],
            restartPolicy: "restart",
            terminationGracePeriodSeconds: 1,
            dnsPolicy: "no",
            hostPID: true,
            schedulerName: "string",
          },
        },
      },
    },
    successfulJobsHistoryLimit: 1,
    failedJobsHistoryLimit: 1,
  },
});

const suspendedCronJob = new CronJob({
  apiVersion: "foo",
  kind: "CronJob",
  metadata: {
    name: "suspendedCronJob",
    resourceVersion: "suspendedCronJob",
    uid: "suspendedCronJob",
    namespace: "default",
    selfLink: "/apis/batch/v1beta1/cronjobs/default/suspendedCronJob",
  },
  spec: {
    schedule: "test",
    concurrencyPolicy: "test",
    suspend: true,
    jobTemplate: {
      metadata: {},
      spec: {
        template: {
          metadata: {},
          spec: {
            containers: [],
            restartPolicy: "restart",
            terminationGracePeriodSeconds: 1,
            dnsPolicy: "no",
            hostPID: true,
            schedulerName: "string",
          },
        },
      },
    },
    successfulJobsHistoryLimit: 1,
    failedJobsHistoryLimit: 1,
  },
});

const otherSuspendedCronJob = new CronJob({
  apiVersion: "foo",
  kind: "CronJob",
  metadata: {
    name: "otherSuspendedCronJob",
    resourceVersion: "otherSuspendedCronJob",
    uid: "otherSuspendedCronJob",
    namespace: "default",
    selfLink: "/apis/batch/v1beta1/cronjobs/default/otherSuspendedCronJob",
  },
  spec: {
    schedule: "test",
    concurrencyPolicy: "test",
    suspend: true,
    jobTemplate: {
      metadata: {},
      spec: {
        template: {
          metadata: {},
          spec: {
            containers: [],
            restartPolicy: "restart",
            terminationGracePeriodSeconds: 1,
            dnsPolicy: "no",
            hostPID: true,
            schedulerName: "string",
          },
        },
      },
    },
    successfulJobsHistoryLimit: 1,
    failedJobsHistoryLimit: 1,
  },
});

describe("CronJob Store tests", () => {
  let cronJobStore: CronJobStore;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(createStoresAndApisInjectable, () => true);

    cronJobStore = di.inject(cronJobStoreInjectable);
  });

  it("gets CronJob statuses in proper sorting order", () => {
    const statuses = Object.entries(cronJobStore.getStatuses([
      suspendedCronJob,
      otherSuspendedCronJob,
      scheduledCronJob,
    ]));

    expect(statuses).toEqual([
      ["scheduled", 1],
      ["suspended", 2],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(cronJobStore.getStatuses([scheduledCronJob]));

    expect(statuses).toEqual([
      ["scheduled", 1],
      ["suspended", 0],
    ]);

    statuses = Object.entries(cronJobStore.getStatuses([suspendedCronJob]));

    expect(statuses).toEqual([
      ["scheduled", 0],
      ["suspended", 1],
    ]);
  });
});
