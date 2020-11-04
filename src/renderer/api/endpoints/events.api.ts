import moment from "moment";
import { KubeObject } from "../kube-object";
import { formatDuration } from "../../utils/formatDuration";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

@autobind()
export class KubeEvent extends KubeObject {
  static kind = "Event"
  static namespaced = true
  static apiBase = "/api/v1/events"

  involvedObject: {
    kind: string;
    namespace: string;
    name: string;
    uid: string;
    apiVersion: string;
    resourceVersion: string;
    fieldPath: string;
  }
  reason: string
  message: string
  source: {
    component: string;
    host: string;
  }
  firstTimestamp: string
  lastTimestamp: string
  count: number
  type: string
  eventTime: null
  reportingComponent: string
  reportingInstance: string

  isWarning() {
    return this.type === "Warning";
  }

  getSource() {
    const { component, host } = this.source
    return `${component} ${host || ""}`
  }

  getFirstSeenTime() {
    const diff = moment().diff(this.firstTimestamp)
    return formatDuration(diff, true)
  }

  getLastSeenTime() {
    const diff = moment().diff(this.lastTimestamp)
    return formatDuration(diff, true)
  }
}

export const eventApi = new KubeApi({
  objectConstructor: KubeEvent,
})
