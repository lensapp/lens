/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type React from "react";
import loggerInjectable from "../../../common/logger.injectable";
import showCheckedErrorNotificationInjectable from "../notifications/show-checked-error.injectable";
import kubeconfigDialogStateInjectable from "./state.injectable";

export interface OpenKubeconfigDialogArgs {
  title?: React.ReactNode;
  loader: () => Promise<string>;
}

export type OpenKubeconfigDialog = (openArgs: OpenKubeconfigDialogArgs) => void;

const openKubeconfigDialogInjectable = getInjectable({
  id: "open-kubeconfig-dialog",
  instantiate: (di): OpenKubeconfigDialog => {
    const state = di.inject(kubeconfigDialogStateInjectable);
    const showCheckedErrorNotification = di.inject(showCheckedErrorNotificationInjectable);
    const logger = di.inject(loggerInjectable);

    return ({ title, loader }) => {
      (async () => {
        try {
          const config = await loader();

          state.set({ title, config });
        } catch (error) {
          showCheckedErrorNotification(error, "Failed to retrive config for dialog");
          logger.warn("[KUBEOCONFIG-DIALOG]: failed to retrived config for dialog", error);
        }
      })();
    };
  },
});

export default openKubeconfigDialogInjectable;
