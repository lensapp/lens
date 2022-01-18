/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";
import { KubeObject } from "../kube-object";
import { formatDuration } from "../../utils/formatDuration";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface KubeEvent {
  involvedObject: {
    kind: string;
    namespace: string;
    name: string;
    uid: string;
    apiVersion: string;
    resourceVersion: string;
    fieldPath: string;
  };
  reason: string;
  message: string;
  source: {
    component: string;
    host: string;
  };
  firstTimestamp: string;
  lastTimestamp: string;
  count: number;
  type: "Normal" | "Warning" | string;
  eventTime: null;
  reportingComponent: string;
  reportingInstance: string;
}

export class KubeEvent extends KubeObject {
  static kind = "Event";
  static namespaced = true;
  static apiBase = "/api/v1/events";

  isWarning() {
    return this.type === "Warning";
  }

  getSource() {
    const { component, host } = this.source;

    return `${component} ${host || ""}`;
  }

  getFirstSeenTime() {
    const diff = moment().diff(this.firstTimestamp);

    return formatDuration(diff, true);
  }

  getLastSeenTime() {
    const diff = moment().diff(this.lastTimestamp);

    return formatDuration(diff, true);
  }
}

let eventApi: KubeApi<KubeEvent>;

if (isClusterPageContext()) {
  eventApi = new KubeApi<KubeEvent>({
    objectConstructor: KubeEvent,
  });
}

export {
  eventApi,
};
