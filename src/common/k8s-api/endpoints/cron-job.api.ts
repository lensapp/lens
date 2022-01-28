/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";
import { KubeObject } from "../kube-object";
import type { IPodContainer } from "./pod.api";
import { formatDuration } from "../../utils/formatDuration";
import { autoBind } from "../../utils";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";

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

export class CronJobApi extends KubeApi<CronJob> {
  constructor(args: SpecificApiOptions<CronJob> = {}) {
    super({
      ...args,
      objectConstructor: CronJob,
    });
  }

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
