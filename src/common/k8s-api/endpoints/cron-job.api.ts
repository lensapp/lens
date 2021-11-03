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

import moment from "moment";
import { KubeObject } from "../kube-object";
import type { IPodContainer } from "./pods.api";
import { formatDuration } from "../../utils/formatDuration";
import { autoBind } from "../../utils";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export class CronJobApi extends KubeApi<CronJob> {
  suspend(params: { namespace: string; name: string }) {
    return this.request.patch(this.getUrl(params), {
      data: {
        spec: {
          suspend: true,
        },
      },
    },
    {
      headers: {
        "content-type": "application/strategic-merge-patch+json",
      },
    });
  }

  resume(params: { namespace: string; name: string }) {
    return this.request.patch(this.getUrl(params), {
      data: {
        spec: {
          suspend: false,
        },
      },
    },
    {
      headers: {
        "content-type": "application/strategic-merge-patch+json",
      },
    });
  }
}

export interface CronJob {
  spec: {
    schedule: string;
    concurrencyPolicy: string;
    suspend: boolean;
    jobTemplate: {
      metadata: {
        creationTimestamp?: string;
        labels?: {
          [key: string]: string;
        };
        annotations?: {
          [key: string]: string;
        };
      };
      spec: {
        template: {
          metadata: {
            creationTimestamp?: string;
          };
          spec: {
            containers: IPodContainer[];
            restartPolicy: string;
            terminationGracePeriodSeconds: number;
            dnsPolicy: string;
            hostPID: boolean;
            schedulerName: string;
          };
        };
      };
    };
    successfulJobsHistoryLimit: number;
    failedJobsHistoryLimit: number;
  };
  status: {
    lastScheduleTime?: string;
  };
}

export class CronJob extends KubeObject {
  static kind = "CronJob";
  static namespaced = true;
  static apiBase = "/apis/batch/v1beta1/cronjobs";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getSuspendFlag() {
    return this.spec.suspend.toString();
  }

  getLastScheduleTime() {
    if (!this.status.lastScheduleTime) return "-";
    const diff = moment().diff(this.status.lastScheduleTime);

    return formatDuration(diff, true);
  }

  getSchedule() {
    return this.spec.schedule;
  }

  isNeverRun() {
    const schedule = this.getSchedule();
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const stamps = schedule.split(" ");
    const day = Number(stamps[stamps.length - 3]);  // 1-31
    const month = Number(stamps[stamps.length - 2]);  // 1-12

    if (schedule.startsWith("@")) return false;

    return day > daysInMonth[month - 1];
  }

  isSuspend() {
    return this.spec.suspend;
  }
}

/**
 * Only available within kubernetes cluster pages
 */
let cronJobApi: CronJobApi;

if (isClusterPageContext()) {
  cronJobApi = new CronJobApi({
    objectConstructor: CronJob,
  });
}

export {
  cronJobApi,
};
