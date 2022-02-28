/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import createTerminalTabInjectable from "../../renderer/components/dock/terminal/create-terminal-tab.injectable";
import terminalStoreInjectable from "../../renderer/components/dock/terminal/store.injectable";
import type { TerminalStore as TerminalStoreType, TerminalTab } from "../../renderer/components/dock/terminal/store";
import { asLegacyGlobalObjectForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import logTabStoreInjectable from "../../renderer/components/dock/logs/tab-store.injectable";

import commandOverlayInjectable from "../../renderer/components/command-palette/command-overlay.injectable";
import type { CommandOverlay as CommandPalletState } from "../../renderer/components/command-palette/command-overlay.injectable";
import createPodLogsTabInjectable, { PodLogsTabData } from "../../renderer/components/dock/logs/create-pod-logs-tab.injectable";
import createWorkloadLogsTabInjectable, { WorkloadLogsTabData } from "../../renderer/components/dock/logs/create-workload-logs-tab.injectable";
import sendCommandInjectable, { SendCommandOptions } from "../../renderer/components/dock/terminal/send-command.injectable";
import { podsStore } from "../../renderer/components/+workloads-pods/pods.store";
import renameTabInjectable from "../../renderer/components/dock/dock/rename-tab.injectable";
import type { DockTabStorageState } from "../../renderer/components/dock/dock-tab-store/dock-tab.store";
import type { LogTabData, LogTabOwnerRef, LogTabStore } from "../../renderer/components/dock/logs/tab-store";
import type { CommandActionContext, CommandActionNavigateOptions } from "../../renderer/components/command-palette/registered-commands/commands";
import type { TerminalApi, TerminalApiQuery, TerminalChannels, TerminalEvents, TerminalMessage } from "../../renderer/api/terminal-api";
import type { Terminal } from "../../renderer/components/dock/terminal/terminal";
import type { WebSocketApiState } from "../../renderer/api/websocket-api";
import type { HeaderCustomizer, ItemsFilters, ItemsFilter, SearchFilter, SearchFilters, HeaderPlaceholders, ItemListLayout, ItemListLayoutProps } from "../../renderer/components/item-object-list";
import type { ItemListLayoutHeader, ItemListLayoutHeaderProps } from "../../renderer/components/item-object-list/header";
import type { Filter, FilterType } from "../../renderer/components/item-object-list/page-filters.store";

// layouts
export * from "../../renderer/components/layout/main-layout";
export * from "../../renderer/components/layout/setting-layout";
export * from "../../renderer/components/layout/page-layout";
export * from "../../renderer/components/layout/wizard-layout";
export * from "../../renderer/components/layout/tab-layout";

// form-controls
export * from "../../renderer/components/button";
export * from "../../renderer/components/checkbox";
export * from "../../renderer/components/radio";
export * from "../../renderer/components/select";
export * from "../../renderer/components/slider";
export { FormSwitch, Switcher } from "../../renderer/components/switch";
export type { SwitcherProps, SwitcherStyles } from "../../renderer/components/switch";
export {
  Input,
  InputValidators,
  SearchInput,
} from "../../renderer/components/input";
export type {
  IconData,
  IconDataFnArg,
  InputElement,
  InputElementProps,
  InputProps,
  InputState,
  InputValidator,
  SearchInputProps,
  SearchInputUrlProps,
} from "../../renderer/components/input";

// command-overlay
export type {
  CommandPalletState,
  CommandActionContext,
  CommandActionNavigateOptions,
};
export const CommandOverlay = asLegacyGlobalObjectForExtensionApi(commandOverlayInjectable) as CommandPalletState;

export type {
  CategoryColumnRegistration,
  AdditionalCategoryColumnRegistration,
  TitleCellProps,
} from "../../renderer/components/+catalog/custom-category-columns";

// other components
export * from "../../renderer/components/icon";
export * from "../../renderer/components/tooltip";
export * from "../../renderer/components/tabs";
export * from "../../renderer/components/table";
export * from "../../renderer/components/badge";
export * from "../../renderer/components/drawer";
export * from "../../renderer/components/dialog";
export * from "../../renderer/components/confirm-dialog";
export * from "../../renderer/components/line-progress";
export * from "../../renderer/components/menu";
export * from "../../renderer/components/notifications";
export * from "../../renderer/components/spinner";
export * from "../../renderer/components/stepper";
export * from "../../renderer/components/wizard";
export * from "../../renderer/components/+workloads-pods/pod-details-list";
export * from "../../renderer/components/+namespaces/namespace-select";
export * from "../../renderer/components/+namespaces/namespace-select-filter";
export * from "../../renderer/components/layout/sub-title";
export * from "../../renderer/components/chart";

// kube helpers
export * from "../../renderer/components/kube-detail-params";
export * from "../../renderer/components/kube-object-details";
export * from "../../renderer/components/kube-object-list-layout";
export type { AddRemoveButtonsProps } from "../../renderer/components/add-remove-buttons";
export {
  cssNames,
  type IClassName,
  type IClassNameMap,
} from "../../renderer/utils";
export type {
  HeaderCustomizer,
  ItemsFilters,
  ItemsFilter,
  FilterType,
  Filter,
  SearchFilter,
  SearchFilters,
  HeaderPlaceholders,
  ItemListLayout,
  ItemListLayoutProps,
  ItemListLayoutHeader,
  ItemListLayoutHeaderProps,
};
export * from "../../renderer/components/kube-object-menu";
export * from "../../renderer/components/kube-object-meta";
export * from "../../renderer/components/+events/kube-event-details";

// specific exports
export * from "../../renderer/components/status-brick";

export type {
  SendCommandOptions,
  PodLogsTabData,
  WorkloadLogsTabData,
  DockTabStorageState,
};

export type {
  TabKind,
  TabId,
  DockTabCreateOption,
  BaseDockTabCreateOptions,
} from "../../renderer/components/dock/dock/store";

export const createTerminalTab = asLegacyGlobalFunctionForExtensionApi(createTerminalTabInjectable);

export type {
  TerminalStoreType,
  TerminalApi,
  Terminal,
  TerminalTab,
  TerminalApiQuery,
  WebSocketApiState,
  TerminalEvents,
  TerminalMessage,
  TerminalChannels,
};
export const terminalStore = Object.assign(asLegacyGlobalObjectForExtensionApi(terminalStoreInjectable), {
  sendCommand: asLegacyGlobalFunctionForExtensionApi(sendCommandInjectable),
});

export const TerminalStore = {
  getInstance() {
    return terminalStore;
  },
  createInstance() {
    return terminalStore;
  },
  resetInstance() {
    console.warn("TerminalStore.resetInstance() does nothing");
  },
};

export type { LogTabStore, LogTabData, LogTabOwnerRef };
export const logTabStore = Object.assign(asLegacyGlobalObjectForExtensionApi(logTabStoreInjectable), {
  createPodTab: asLegacyGlobalFunctionForExtensionApi(createPodLogsTabInjectable),
  createWorkloadTab: asLegacyGlobalFunctionForExtensionApi(createWorkloadLogsTabInjectable),
  renameTab: (tabId: string): void => {
    const renameTab = asLegacyGlobalFunctionForExtensionApi(renameTabInjectable);
    const tabData = logTabStore.getData(tabId);
    const pod = podsStore.getById(tabData.selectedPodId);

    renameTab(tabId, `Pod ${pod.getName()}`);
  },
  tabs: undefined,
});
