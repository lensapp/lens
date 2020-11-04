import { KubeObjectStatus, K8sApi } from "@k8slens/extensions";

export function resolveStatus(object: K8sApi.KubeObject): KubeObjectStatus.Status {
  const eventStore = K8sApi.apiManager.getStore(K8sApi.eventApi)
  const events = (eventStore as K8sApi.EventStore).getEventsByObject(object);
  let warnings = events.filter(evt => evt.isWarning());
  if (!events.length || !warnings.length) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event
  return {
    level: KubeObjectStatus.Level.WARNING,
    text: `${event.message}`,
    timestamp: event.metadata.creationTimestamp
  }
}

export function resolveStatusForPods(pod: K8sApi.Pod): KubeObjectStatus.Status {
  if (!pod.hasIssues()) {
    return null
  }
  const eventStore = K8sApi.apiManager.getStore(K8sApi.eventApi)
  const events = (eventStore as K8sApi.EventStore).getEventsByObject(pod);
  let warnings = events.filter(evt => evt.isWarning());
  if (!events.length || !warnings.length) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event
  return {
    level: KubeObjectStatus.Level.WARNING,
    text: `${event.message}`,
    timestamp: event.metadata.creationTimestamp
  }
}

export function resolveStatusForCronJobs(cronJob: K8sApi.CronJob): KubeObjectStatus.Status {
  const eventStore = K8sApi.apiManager.getStore(K8sApi.eventApi)
  let events = (eventStore as K8sApi.EventStore).getEventsByObject(cronJob);
  let warnings = events.filter(evt => evt.isWarning());
  if (cronJob.isNeverRun()) {
    events = events.filter(event => event.reason != "FailedNeedsStart");
  }
  if (!events.length || !warnings.length) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event
  return {
    level: KubeObjectStatus.Level.WARNING,
    text: `${event.message}`,
    timestamp: event.metadata.creationTimestamp
  }
}