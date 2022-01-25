/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import createTerminalTabInjectable from "../../renderer/components/dock/create-terminal-tab/create-terminal-tab.injectable";
import terminalStoreInjectable from "../../renderer/components/dock/terminal-store/terminal-store.injectable";
import { asLegacyGlobalObjectForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import logTabStoreInjectable from "../../renderer/components/dock/logs/tab-store.injectable";
import { asLegacyGlobalSingletonForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-singleton-for-extension-api";
import { TerminalStore as TerminalStoreClass } from "../../renderer/components/dock/terminal-store/terminal.store";

import commandOverlayInjectable from "../../renderer/components/command-palette/command-overlay.injectable";

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
export * from "../../renderer/components/switch";
export * from "../../renderer/components/input/input";

// command-overlay
export const CommandOverlay = asLegacyGlobalObjectForExtensionApi(commandOverlayInjectable);

export type {
  CategoryColumnRegistration,
  AdditionalCategoryColumnRegistration,
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
export * from "../../renderer/components/input/search-input";
export * from "../../renderer/components/chart/bar-chart";
export * from "../../renderer/components/chart/pie-chart";

// kube helpers
export * from "../../renderer/components/kube-detail-params";
export * from "../../renderer/components/kube-object-details";
export * from "../../renderer/components/kube-object-list-layout";
export * from "../../renderer/components/kube-object-menu";
export * from "../../renderer/components/kube-object-meta";
export * from "../../renderer/components/+events/kube-event-details";

// specific exports
export * from "../../renderer/components/status-brick";

export const createTerminalTab = asLegacyGlobalFunctionForExtensionApi(createTerminalTabInjectable);
export const TerminalStore = asLegacyGlobalSingletonForExtensionApi(TerminalStoreClass, terminalStoreInjectable);
export const terminalStore = asLegacyGlobalObjectForExtensionApi(terminalStoreInjectable);
export const logTabStore = asLegacyGlobalObjectForExtensionApi(logTabStoreInjectable);

