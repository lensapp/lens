import moment from "moment";
import { KubeObject } from "../kube-object";
import { PodContainer } from "./pods.api";
import { formatDuration } from "../../utils/formatDuration";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

@autobind()
export class CronJob extends KubeObject {
  static kind = "CronJob"

  kind: string
  apiVersion: string
  metadata: {
    name: string;
    namespace: string;
    selfLink: string;
    uid: string;
    resourceVersion: string;
    creationTimestamp: string;
    labels: {
      [key: string]: string;
    };
    annotations: {
      [key: string]: string;
    };
  }
  spec: {
    schedule: string;
    concurrencyPolicy: string;
    suspend: boolean;
    jobTemplate: {
      metadata: {
        creationTimestamp?: string;
      };
      spec: {
        template: {
          metadata: {
            creationTimestamp?: string;
          };
          spec: {
            containers: PodContainer[];
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
  }
  status: {
    lastScheduleTime: string;
  }

  getSuspendFlag(): string {
    return this.spec.suspend.toString();
  }

  getLastScheduleTime(): string {
    return formatDuration(moment().diff(this.status.lastScheduleTime), true);
  }

  getSchedule(): string {
    return this.spec.schedule;
  }

  isNeverRun(): boolean {
    const schedule = this.getSchedule();
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const stamps = schedule.split(" ");
    const day = Number(stamps[stamps.length - 3]);  // 1-31
    const month = Number(stamps[stamps.length - 2]);  // 1-12
    if (schedule.startsWith("@")) {
      return false;
    }
    return day > daysInMonth[month - 1];
  }
}

export const cronJobApi = new KubeApi({
  kind: CronJob.kind,
  apiBase: "/apis/batch/v1beta1/cronjobs",
  isNamespaced: true,
  objectConstructor: CronJob,
});
