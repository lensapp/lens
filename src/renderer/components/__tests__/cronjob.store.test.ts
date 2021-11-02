/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import { CronJob } from "../../../common/k8s-api/endpoints";

const spec = {
  schedule: "test",
  concurrencyPolicy: "test",
  suspend: true,
  jobTemplate: {
    metadata: {},
    spec: {
      template: {
        metadata: {},
        spec: {
          containers: [] as any,
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
};

const scheduledCronJob = new CronJob({
  apiVersion: "foo",
  kind: "CronJob",
  metadata: {
    name: "scheduledCronJob",
    resourceVersion: "scheduledCronJob",
    uid: "scheduledCronJob",
    namespace: "default",
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
  },
});

scheduledCronJob.spec = { ...spec };
suspendedCronJob.spec = { ...spec };
otherSuspendedCronJob.spec = { ...spec };
scheduledCronJob.spec.suspend = false;

describe("CronJob Store tests", () => {
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
