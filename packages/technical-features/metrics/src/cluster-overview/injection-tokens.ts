/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type React from "react";
import { getInjectionToken } from "@ogre-tools/injectable";
import type { LensTheme } from "./components/chart/lens-theme";
import type { IComputedValue } from "mobx";

export type ClusterOverviewUIBlock = {
  id: string;
  Component: React.ElementType;
};

export const clusterOverviewUIBlockInjectionToken = getInjectionToken<ClusterOverviewUIBlock>({
  id: "cluster-overview-ui-block-injection-token",
});

// Hack: any
export type ClusterOverviewStore = any;

export const clusterOverviewStoreInjectionToken = getInjectionToken<ClusterOverviewStore>({
  id: "cluster-overview-store-injection-token",
});

// Hack: any
export type UserStore = any;

export const userStoreInjectionToken = getInjectionToken<UserStore>({
  id: "user-store-injection-token",
});

// Hack: any
export type NodeStore = any;

export const nodeStoreInjectionToken = getInjectionToken<NodeStore>({
  id: "node-store-injection-token",
});

export const navigateToPreferencesOfMetricsInjectionToken = getInjectionToken<() => void>({
  id: "navigate-to-preferences-of-metrics-injection-token",
});

export const activeThemeInjectionToken = getInjectionToken<IComputedValue<LensTheme>>({
  id: "active-theme-injection-token",
});

type LoggerFunction = (message: string, ...additionals: any[]) => void;

export type Logger = {
  debug: LoggerFunction;
  info: LoggerFunction;
  warn: LoggerFunction;
  error: LoggerFunction;
  silly: LoggerFunction;
};

export const loggerInjectionToken = getInjectionToken<Logger>({
  id: "logger-injection-token",
});

export enum MetricType {
  MEMORY = "memory",
  CPU = "cpu",
}

export enum MetricNodeRole {
  MASTER = "master",
  WORKER = "worker",
}
