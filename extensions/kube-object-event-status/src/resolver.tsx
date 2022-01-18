/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@k8slens/extensions";

const { apiManager, eventApi, KubeObjectStatusLevel } = Renderer.K8sApi;

type KubeObject = Renderer.K8sApi.KubeObject;
type Pod = Renderer.K8sApi.Pod;
type CronJob = Renderer.K8sApi.CronJob;
type KubeObjectStatus = Renderer.K8sApi.KubeObjectStatus;
type EventStore = Renderer.K8sApi.EventStore;

export function resolveStatus(object: KubeObject): KubeObjectStatus {
  const eventStore = apiManager.getStore(eventApi);
  const events = (eventStore as EventStore).getEventsByObject(object);
  const warnings = events.filter(evt => evt.isWarning());

  if (!events.length || !warnings.length) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event

  return {
    level: KubeObjectStatusLevel.WARNING,
    text: `${event.message}`,
    timestamp: event.metadata.creationTimestamp,
  };
}

export function resolveStatusForPods(pod: Pod): KubeObjectStatus {
  if (!pod.hasIssues()) {
    return null;
  }
  const eventStore = apiManager.getStore(eventApi);
  const events = (eventStore as EventStore).getEventsByObject(pod);
  const warnings = events.filter(evt => evt.isWarning());

  if (!events.length || !warnings.length) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event

  return {
    level: KubeObjectStatusLevel.WARNING,
    text: `${event.message}`,
    timestamp: event.metadata.creationTimestamp,
  };
}

export function resolveStatusForCronJobs(cronJob: CronJob): KubeObjectStatus {
  const eventStore = apiManager.getStore(eventApi);
  let events = (eventStore as EventStore).getEventsByObject(cronJob);
  const warnings = events.filter(evt => evt.isWarning());

  if (cronJob.isNeverRun()) {
    events = events.filter(event => event.reason != "FailedNeedsStart");
  }

  if (!events.length || !warnings.length) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event

  return {
    level: KubeObjectStatusLevel.WARNING,
    text: `${event.message}`,
    timestamp: event.metadata.creationTimestamp,
  };
}
