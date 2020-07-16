// IPC messages (all channels)
// All values must be unique

export enum ClusterIpcMessage {
  ADD = "cluster-add",
  STOP = "cluster-stop",
  REMOVE = "cluster-remove",
  REMOVE_WORKSPACE = "cluster-remove-all-from-workspace",
  FEATURE_INSTALL = "cluster-feature-install",
  FEATURE_UPGRADE = "cluster-feature-upgrade",
  FEATURE_REMOVE = "cluster-feature-remove",
  ICON_SAVE = "cluster-icon-save",
  ICON_RESET = "cluster-icon-reset",
}
