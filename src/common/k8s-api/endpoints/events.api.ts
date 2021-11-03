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
