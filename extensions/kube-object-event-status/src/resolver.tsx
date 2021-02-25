import { K8sApi } from "@k8slens/extensions";

export function resolveStatus(object: K8sApi.KubeObject): K8sApi.KubeObjectStatus {
  const eventStore = K8sApi.apiManager.getStore(K8sApi.eventApi);
  const events = (eventStore as K8sApi.EventStore).getEventsByObject(object);
  const warnings = events.filter(evt => evt.isWarning());

  if (!events.length || !warnings.length) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event

  return {
    level: K8sApi.KubeObjectStatusLevel.WARNING,
    text: `${event.message}`,
    timestamp: event.metadata.creationTimestamp
  };
}

export function resolveStatusForPods(pod: K8sApi.Pod): K8sApi.KubeObjectStatus {
  if (!pod.hasIssues()) {
    return null;
  }
  const eventStore = K8sApi.apiManager.getStore(K8sApi.eventApi);
  const events = (eventStore as K8sApi.EventStore).getEventsByObject(pod);
  const warnings = events.filter(evt => evt.isWarning());

  if (!events.length || !warnings.length) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event

  return {
    level: K8sApi.KubeObjectStatusLevel.WARNING,
    text: `${event.message}`,
    timestamp: event.metadata.creationTimestamp
  };
}

export function resolveStatusForCronJobs(cronJob: K8sApi.CronJob): K8sApi.KubeObjectStatus {
  const eventStore = K8sApi.apiManager.getStore(K8sApi.eventApi);
  let events = (eventStore as K8sApi.EventStore).getEventsByObject(cronJob);
  const warnings = events.filter(evt => evt.isWarning());

  if (cronJob.isNeverRun()) {
    events = events.filter(event => event.reason != "FailedNeedsStart");
  }

  if (!events.length || !warnings.length) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event

  return {
    level: K8sApi.KubeObjectStatusLevel.WARNING,
    text: `${event.message}`,
    timestamp: event.metadata.creationTimestamp
  };
}
