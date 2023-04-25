/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { asLegacyGlobalFunctionForExtensionApi, asLegacyGlobalForExtensionApi } from "@k8slens/legacy-global-di";
import createTerminalTabInjectable from "../../renderer/components/dock/terminal/create-terminal-tab.injectable";
import terminalStoreInjectable from "../../renderer/components/dock/terminal/store.injectable";
import logTabStoreInjectable from "../../renderer/components/dock/logs/tab-store.injectable";

import commandOverlayInjectable from "../../renderer/components/command-palette/command-overlay.injectable";
import createPodLogsTabInjectable from "../../renderer/components/dock/logs/create-pod-logs-tab.injectable";
import createWorkloadLogsTabInjectable from "../../renderer/components/dock/logs/create-workload-logs-tab.injectable";
import sendCommandInjectable from "../../renderer/components/dock/terminal/send-command.injectable";
import renameTabInjectable from "../../renderer/components/dock/dock/rename-tab.injectable";
import { ConfirmDialog as _ConfirmDialog } from "../../renderer/components/confirm-dialog";
import type { ConfirmDialogBooleanParams, ConfirmDialogParams, ConfirmDialogProps } from "../../renderer/components/confirm-dialog";
import openConfirmDialogInjectable from "../../renderer/components/confirm-dialog/open.injectable";
import confirmInjectable from "../../renderer/components/confirm-dialog/confirm.injectable";
import notificationsStoreInjectable from "../../renderer/components/notifications/notifications-store.injectable";
import podStoreInjectable from "../../renderer/components/workloads-pods/store.injectable";
import getDetailsUrlInjectable from "../../renderer/components/kube-detail-params/get-details-url.injectable";
import showDetailsInjectable from "../../renderer/components/kube-detail-params/show-details.injectable";
import showCheckedErrorNotificationInjectable from "../../renderer/components/notifications/show-checked-error.injectable";
import showErrorNotificationInjectable from "../../renderer/components/notifications/show-error-notification.injectable";
import showInfoNotificationInjectable from "../../renderer/components/notifications/show-info-notification.injectable";
import showShortInfoNotificationInjectable from "../../renderer/components/notifications/show-short-info.injectable";
import showSuccessNotificationInjectable from "../../renderer/components/notifications/show-success-notification.injectable";

// layouts
export * from "../../renderer/components/layout/main-layout";
export * from "../../renderer/components/layout/setting-layout";
export * from "../../renderer/components/layout/page-layout";
export * from "../../renderer/components/layout/wizard-layout";
export * from "../../renderer/components/layout/tab-layout";

// form-controls
export * from "@k8slens/button";
export * from "../../renderer/components/checkbox";
export * from "../../renderer/components/radio";
export * from "../../renderer/components/select";
export * from "../../renderer/components/slider";
export * from "../../renderer/components/switch";
export * from "../../renderer/components/input/input";

// command-overlay
export const CommandOverlay = asLegacyGlobalForExtensionApi(commandOverlayInjectable);

export type {
  CategoryColumnRegistration,
  AdditionalCategoryColumnRegistration,
} from "../../renderer/components/catalog/custom-category-columns";

// other components
export type {
  ConfirmDialogBooleanParams,
  ConfirmDialogParams,
  ConfirmDialogProps,
};
export const ConfirmDialog = Object.assign(_ConfirmDialog, {
  open: asLegacyGlobalFunctionForExtensionApi(openConfirmDialogInjectable),
  confirm: asLegacyGlobalFunctionForExtensionApi(confirmInjectable),
});

export * from "../../renderer/components/icon";
export * from "@k8slens/tooltip";
export * from "../../renderer/components/tabs";
export * from "../../renderer/components/table";
export * from "../../renderer/components/badge";
export * from "../../renderer/components/drawer";
export * from "../../renderer/components/dialog";
export * from "../../renderer/components/line-progress";
export * from "../../renderer/components/menu";

export {
  NotificationStatus,
  type CreateNotificationOptions,
  type Notification,
  type NotificationId,
  type NotificationMessage,
  type ShowNotification,
  type NotificationsStore,
} from "../../renderer/components/notifications";

export const Notifications = {
  ok: asLegacyGlobalFunctionForExtensionApi(showSuccessNotificationInjectable),
  error: asLegacyGlobalFunctionForExtensionApi(showErrorNotificationInjectable),
  checkedError: asLegacyGlobalFunctionForExtensionApi(showCheckedErrorNotificationInjectable),
  info: asLegacyGlobalFunctionForExtensionApi(showInfoNotificationInjectable),
  shortInfo: asLegacyGlobalFunctionForExtensionApi(showShortInfoNotificationInjectable),
};

export * from "../../renderer/components/spinner";
export * from "../../renderer/components/stepper";
export * from "../../renderer/components/wizard";
export * from "../../renderer/components/workloads-pods/pod-details-list";
export * from "../../renderer/components/namespaces/namespace-select";
export * from "../../renderer/components/namespaces/namespace-select-filter";
export * from "../../renderer/components/layout/sub-title";
export * from "../../renderer/components/input/search-input";
export * from "../../renderer/components/chart/bar-chart";
export * from "../../renderer/components/chart/pie-chart";
export {
  MonacoEditor,
  type MonacoEditorProps, type MonacoEditorId,
  type MonacoTheme, type MonacoCustomTheme,
} from "../../renderer/components/monaco-editor";
export * from "../../renderer/components/resource-metrics/resource-metrics";
export * from "../../renderer/components/workloads-pods/pod-charts";

/**
 * @deprecated Use `Renderer.Navigation.getDetailsUrl`
 */
export const getDetailsUrl = asLegacyGlobalFunctionForExtensionApi(getDetailsUrlInjectable);

/**
 * @deprecated Use `Renderer.Navigation.showDetails`
 */
export const showDetails = asLegacyGlobalFunctionForExtensionApi(showDetailsInjectable);

// kube helpers
export * from "../../renderer/components/kube-object-details";
export * from "../../renderer/components/kube-object-list-layout";
export * from "../../renderer/components/kube-object-menu";
export * from "../../renderer/components/kube-object-meta";
export * from "../../renderer/components/events/kube-event-details";

// specific exports
export * from "../../renderer/components/status-brick";

export const createTerminalTab = asLegacyGlobalFunctionForExtensionApi(createTerminalTabInjectable);

export const terminalStore = Object.assign(
  asLegacyGlobalForExtensionApi(terminalStoreInjectable),
  {
    sendCommand: asLegacyGlobalFunctionForExtensionApi(sendCommandInjectable),
  },
);

const renameTab = asLegacyGlobalFunctionForExtensionApi(renameTabInjectable);
const podStore = asLegacyGlobalForExtensionApi(podStoreInjectable);

export const logTabStore = Object.assign(
  asLegacyGlobalForExtensionApi(logTabStoreInjectable),
  {
    createPodTab: asLegacyGlobalFunctionForExtensionApi(createPodLogsTabInjectable),
    createWorkloadTab: asLegacyGlobalFunctionForExtensionApi(createWorkloadLogsTabInjectable),
    renameTab: (tabId: string): void => {
      const { selectedPodId } = logTabStore.getData(tabId) ?? {};
      const pod = selectedPodId && podStore.getById(selectedPodId);

      if (pod) {
        renameTab(tabId, `Pod ${pod.getName()}`);
      }
    },
    tabs: undefined,
  },
);

export class TerminalStore {
  static getInstance() {
    return terminalStore;
  }

  static createInstance() {
    return terminalStore;
  }

  static resetInstance() {
    console.warn("TerminalStore.resetInstance() does nothing");
  }
}

export const notificationsStore = asLegacyGlobalForExtensionApi(notificationsStoreInjectable);
