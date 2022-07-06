/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export type { StatusBarRegistration } from "../../renderer/components/status-bar/status-bar-registration";
export type { KubeObjectMenuRegistration, KubeObjectMenuComponents } from "../../renderer/components/kube-object-menu/kube-object-menu-registration";
export type { AppPreferenceRegistration, AppPreferenceComponents } from "../../renderer/components/+preferences/app-preferences/app-preference-registration";
export type { KubeObjectDetailRegistration, KubeObjectDetailComponents } from "../registries/kube-object-detail-registry";
export type { KubeObjectStatusRegistration } from "../../renderer/components/kube-object-status-icon/kube-object-status-registration";
export type { PageRegistration, RegisteredPage, PageParams, PageComponentProps, PageComponents, PageTarget } from "../registries/page-registry";
export type { ClusterPageMenuRegistration, ClusterPageMenuComponents } from "../registries/page-menu-registry";
export type { ProtocolHandlerRegistration, RouteParams as ProtocolRouteParams, RouteHandler as ProtocolRouteHandler } from "../registries/protocol-handler";
export type { CustomCategoryViewProps, CustomCategoryViewComponents, CustomCategoryViewRegistration } from "../../renderer/components/+catalog/custom-views";
export type { ShellEnvModifier, ShellEnvContext } from "../../main/shell-session/shell-env-modifier/shell-env-modifier-registration";
export type { KubeObjectContextMenuItem, KubeObjectOnContextMenuOpenContext, KubeObjectOnContextMenuOpen, KubeObjectHandlers, KubeObjectHandlerRegistration } from "../../renderer/kube-object/handler";
export type { TrayMenuRegistration } from "../../main/tray/tray-menu-registration";
