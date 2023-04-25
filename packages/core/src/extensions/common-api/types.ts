/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


export type IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
export type IpcRendererEvent = Electron.IpcRendererEvent;
export type IpcMainEvent = Electron.IpcMainEvent;

export type { StatusBarRegistration } from "../../renderer/components/status-bar/status-bar-registration";
export type { KubeObjectMenuRegistration, KubeObjectMenuComponents } from "../../renderer/components/kube-object-menu/kube-object-menu-registration";
export type { AppPreferenceRegistration, AppPreferenceComponents } from "../../features/preferences/renderer/compliance-for-legacy-extension-api/app-preference-registration";
export type { KubeObjectDetailRegistration, KubeObjectDetailComponents } from "../../renderer/components/kube-object-details/kube-object-detail-registration";
export type { KubeObjectStatusRegistration } from "../../renderer/components/kube-object-status-icon/kube-object-status-registration";
export type { PageRegistration, RegisteredPage, PageParams, PageComponentProps, PageComponents, PageTarget } from "../../renderer/routes/page-registration";
export type { ClusterPageMenuRegistration, ClusterPageMenuComponents } from "../../renderer/components/layout/cluster-page-menu";
export type { ProtocolHandlerRegistration, RouteParams as ProtocolRouteParams, RouteHandler as ProtocolRouteHandler } from "../../common/protocol-handler/registration";
export type { CustomCategoryViewProps, CustomCategoryViewComponents, CustomCategoryViewRegistration } from "../../renderer/components/catalog/custom-views";
export type { ShellEnvModifier, ShellEnvContext } from "../../main/shell-session/shell-env-modifier/shell-env-modifier-registration";
export type { KubeObjectContextMenuItem, KubeObjectOnContextMenuOpenContext, KubeObjectOnContextMenuOpen, KubeObjectHandlers, KubeObjectHandlerRegistration } from "../../renderer/kube-object/handler";
export type { TrayMenuRegistration } from "../../main/tray/tray-menu-registration";
export type { MenuRegistration } from "../../features/application-menu/main/menu-registration";
