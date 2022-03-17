/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";
import type { KubeObjectMetadata, ObjectReference } from "../kube-object";
import { KubeObject } from "../kube-object";
import { formatDuration } from "../../utils/formatDuration";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import type { KubeJsonApiData } from "../kube-json-api";

export interface EventSeries {
  count?: number;
  lastObservedTime?: string;
}

export interface EventSource {
  component?: string;
  host?: string;
}

export interface KubeEventData extends KubeJsonApiData<KubeObjectMetadata, void, void> {
  action?: string;
  count?: number;
  eventTime?: string;
  firstTimestamp?: string;
  involvedObject: Required<ObjectReference>;
  lastTimestamp?: string;
  message?: string;
  reason?: string;
  related?: ObjectReference;
  reportingComponent?: string;
  reportingInstance?: string;
  series?: EventSeries;
  source?: EventSource;
  type?: string;
}

export class KubeEvent extends KubeObject {
  static kind = "Event";
  static namespaced = true;
  static apiBase = "/api/v1/events";

  action?: string;
  count?: number;
  eventTime?: string;
  firstTimestamp?: string;
  involvedObject: Required<ObjectReference>;
  lastTimestamp?: string;
  message?: string;
  reason?: string;
  related?: ObjectReference;
  reportingComponent?: string;
  reportingInstance?: string;
  series?: EventSeries;
  source?: EventSource;

  /**
   * Current supported values are:
   * - "Normal"
   * - "Warning"
   */
  type?: string;

  constructor({
    action,
    count,
    eventTime,
    firstTimestamp,
    involvedObject,
    lastTimestamp,
    message,
    reason,
    related,
    reportingComponent,
    reportingInstance,
    series,
    source,
    type,
    ...rest
  }: KubeEventData) {
    super(rest);
    this.action = action;
    this.count = count;
    this.eventTime = eventTime;
    this.firstTimestamp = firstTimestamp;
    this.involvedObject = involvedObject;
    this.lastTimestamp = lastTimestamp;
    this.message = message;
    this.reason = reason;
    this.related = related;
    this.reportingComponent = reportingComponent;
    this.reportingInstance = reportingInstance;
    this.series = series;
    this.source = source;
    this.type = type;
  }

  isWarning() {
    return this.type === "Warning";
  }

  getSource() {
    if (!this.source?.component) {
      return "<unknown>";
    }

    const { component, host = "" } = this.source;

    return `${component} ${host}`;
  }

  /**
   * @deprecated This function is not reactive to changing of time. If rendering use `<ReactiveDuration />` instead
   */
  getFirstSeenTime() {
    const diff = moment().diff(this.firstTimestamp);

    return formatDuration(diff, true);
  }

  /**
   * @deprecated This function is not reactive to changing of time. If rendering use `<ReactiveDuration />` instead
   */
  getLastSeenTime() {
    const diff = moment().diff(this.lastTimestamp);

    return formatDuration(diff, true);
  }
}

export class KubeEventApi extends KubeApi<KubeEvent, KubeEventData> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: KubeEvent,
      ...opts,
    });
  }
}

export const eventApi = isClusterPageContext()
  ? new KubeEventApi()
  : undefined as never;
