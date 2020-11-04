// TODO: add more common re-usable UI components + refactor interfaces (Props -> ComponentProps)

export * from "../../renderer/components/icon"
export * from "../../renderer/components/checkbox"
export * from "../../renderer/components/tooltip"
export * from "../../renderer/components/button"
export * from "../../renderer/components/tabs"
export * from "../../renderer/components/badge"
export * from "../../renderer/components/layout/page-layout"
export * from "../../renderer/components/drawer"

// kube helpers
export { KubeObjectDetailsProps, KubeObjectMenuProps } from "../../renderer/components/kube-object"
export { KubeObjectMeta } from "../../renderer/components/kube-object/kube-object-meta"
export { KubeObjectListLayout, KubeObjectListLayoutProps } from "../../renderer/components/kube-object/kube-object-list-layout";
export { KubeEventDetails } from "../../renderer/components/+events/kube-event-details"

// specific exports
export { ConfirmDialog } from "../../renderer/components/confirm-dialog";
export { MenuItem, SubMenu } from "../../renderer/components/menu";
export { StatusBrick } from "../../renderer/components/status-brick";
export { terminalStore, createTerminalTab } from "../../renderer/components/dock/terminal.store";
export { createPodLogsTab } from "../../renderer/components/dock/pod-logs.store";
