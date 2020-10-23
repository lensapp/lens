import moment from "moment";
import { KubeObject } from "../kube-object";
import { IPodContainer } from "./pods.api";
import { formatDuration } from "../../utils/formatDuration";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

@autobind()
export class CronJob extends KubeObject {
  static kind = "CronJob"
  static namespaced = true
  static apiBase = "/apis/batch/v1beta1/cronjobs"

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
  }
  status: {
    lastScheduleTime?: string;
  }

  getSuspendFlag() {
    return this.spec.suspend.toString()
  }

  getLastScheduleTime() {
    if (!this.status.lastScheduleTime) return "-"
    const diff = moment().diff(this.status.lastScheduleTime)
    return formatDuration(diff, true)
  }

  getSchedule() {
    return this.spec.schedule
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
}

export const cronJobApi = new KubeApi({
  objectConstructor: CronJob,
});
