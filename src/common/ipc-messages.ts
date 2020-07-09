// IPC messages (all channels)

export enum ClusterIpcMessage {
  CLUSTER_ADD = "cluster-add",
  CLUSTER_STOP = "cluster-stop",
  CLUSTER_REMOVE = "cluster-remove",
  CLUSTER_REMOVE_WORKSPACE = "cluster-remove-all-from-workspace",
  CLUSTER_EVENTS = "cluster-events-count",
  FEATURE_INSTALL = "cluster-feature-install",
  FEATURE_UPGRADE = "cluster-feature-upgrade",
  FEATURE_REMOVE = "cluster-feature-remove",
  ICON_SAVE = "cluster-icon-save",
  ICON_RESET = "cluster-icon-reset",
}
