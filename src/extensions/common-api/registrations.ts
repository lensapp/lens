/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type { AppPreferenceRegistration, AppPreferenceComponents } from "../../renderer/components/+preferences/app-preferences/app-preference-registration";
export type { KubeObjectDetailRegistration, KubeObjectDetailComponents } from "../registries/kube-object-detail-registry";
export type { KubeObjectMenuRegistration, KubeObjectMenuComponents } from "../registries/kube-object-menu-registry";
export type { KubeObjectStatusRegistration } from "../registries/kube-object-status-registry";
export type { PageRegistration, RegisteredPage, PageParams, PageComponentProps, PageComponents, PageTarget } from "../registries/page-registry";
export type { ClusterPageMenuRegistration, ClusterPageMenuComponents } from "../registries/page-menu-registry";
export type { StatusBarRegistration } from "../registries/status-bar-registry";
export type { ProtocolHandlerRegistration, RouteParams as ProtocolRouteParams, RouteHandler as ProtocolRouteHandler } from "../registries/protocol-handler";
