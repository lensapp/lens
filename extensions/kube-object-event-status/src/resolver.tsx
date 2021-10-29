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
