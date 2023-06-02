/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { showCheckedErrorNotificationInjectable } from "@k8slens/notifications";
import kubeconfigDialogStateInjectable from "./state.injectable";
import type { StrictReactNode } from "@k8slens/utilities";

export interface OpenKubeconfigDialogArgs {
  title?: StrictReactNode;
  loader: () => Promise<string>;
}

export type OpenKubeconfigDialog = (openArgs: OpenKubeconfigDialogArgs) => void;

const openKubeconfigDialogInjectable = getInjectable({
  id: "open-kubeconfig-dialog",
  instantiate: (di): OpenKubeconfigDialog => {
    const state = di.inject(kubeconfigDialogStateInjectable);
    const showCheckedErrorNotification = di.inject(showCheckedErrorNotificationInjectable);
    const logger = di.inject(loggerInjectionToken);

    return ({ title, loader }) => {
      (async () => {
        try {
          const config = await loader();

          state.set({ title, config });
        } catch (error) {
          showCheckedErrorNotification(error, "Failed to retrieve config for dialog");
          logger.warn("[KUBECONFIG-DIALOG]: failed to retrieve config for dialog", error);
        }
      })();
    };
  },
});

export default openKubeconfigDialogInjectable;
