import { KubeResource } from "../../common/rbac";
import { _i18n } from "../i18n";

export const ResourceNames: Record<KubeResource, string> = {
  "namespaces": _i18n._("Namespaces"),
  "nodes": _i18n._("Nodes"),
  "events": _i18n._("Events"),
  "resourcequotas": _i18n._("Resource Quotas"),
  "services": _i18n._("Services"),
  "secrets": _i18n._("Secrets"),
  "configmaps": _i18n._("Config Maps"),
  "ingresses": _i18n._("Ingresses"),
  "networkpolicies": _i18n._("Network Policies"),
  "persistentvolumes": _i18n._("Persistent Volumes"),
  "storageclasses": _i18n._("Storage Classes"),
  "pods": _i18n._("Pods"),
  "daemonsets": _i18n._("Daemon Sets"),
  "deployments": _i18n._("Deployments"),
  "statefulsets": _i18n._("Stateful Sets"),
  "replicasets": _i18n._("Replica Sets"),
  "jobs": _i18n._("Jobs"),
  "cronjobs": _i18n._("Cron Jobs"),
  "endpoints": _i18n._("Endpoints"),
  "customresourcedefinitions": _i18n._("Custom Resource Definitions"),
  "horizontalpodautoscalers": _i18n._("Horizontal Pod Autoscalers"),
  "podsecuritypolicies": _i18n._("Pod Security Policies"),
  "poddisruptionbudgets": _i18n._("Pod Disruption Budgets"),
};
