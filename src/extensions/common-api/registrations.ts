/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export type { StatusBarRegistration, StatusBarComponents, StatusBarItemProps } from "../../renderer/components/status-bar/status-bar-registration";
export type { KubeObjectMenuRegistration, KubeObjectMenuComponents, KubeObjectMenuItemProps } from "../../renderer/components/kube-object-menu/dependencies/kube-object-menu-items/kube-object-menu-registration";
export type { AppPreferenceRegistration, AppPreferenceComponents } from "../../renderer/components/+preferences/app-preferences/app-preference-registration";
export type { KubeObjectDetailRegistration, KubeObjectDetailComponents } from "../registries/kube-object-detail-registry";
export type { KubeObjectStatusRegistration } from "../registries/kube-object-status-registry";
export type { PageRegistration, RegisteredPage, PageParams, PageComponentProps, PageComponents, PageTarget } from "../registries/page-registry";
export type { ClusterPageMenuRegistration, ClusterPageMenuComponents } from "../registries/page-menu-registry";
export type { MenuRegistration } from "../../main/menu/menu-registration";
export type { MenuTopId } from "../../main/menu/menu";
export type { CatalogEntityDetailRegistration, CatalogEntityDetailsProps, CatalogEntityDetailComponents } from "../registries/catalog-entity-detail-registry";
export type { CustomCategoryViewProps, CustomCategoryViewComponents, CustomCategoryViewRegistration } from "../../renderer/components/+catalog/custom-views";
export type { ShellEnvModifier, ShellEnvContext } from "../../main/shell-session/shell-env-modifier/shell-env-modifier-registration";
export type { ProtocolHandlerRegistration, RouteParams as ProtocolRouteParams, RouteHandler as ProtocolRouteHandler } from "../registries/protocol-handler";
export type { CommandRegistration, CommandContext } from "../../renderer/components/command-palette/registered-commands/commands";
export type { EntitySettingRegistration, EntitySettingViewProps, EntitySettingComponents } from "../registries/entity-setting-registry";
export type { WorkloadsOverviewDetailRegistration, WorkloadsOverviewDetailComponents } from "../registries/workloads-overview-detail-registry";
export type { TopBarRegistration, TopBarComponents } from "../../renderer/components/layout/top-bar/top-bar-registration";
export type { WelcomeBannerRegistration } from "../../renderer/components/+welcome/welcome-banner-items/welcome-banner-registration";
export type { WelcomeMenuRegistration } from "../../renderer/components/+welcome/welcome-menu-items/welcome-menu-registration";
export type { TrayMenuRegistration } from "../../main/tray/tray-menu-registration";
