/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import attemptInstallInjectable from "./attempt-install/attempt-install.injectable";
import attemptInstallByInfoInjectable from "./attempt-install-by-info/attempt-install-by-info.injectable";
import startPreInstallInjectable from "../../extensions/installation-state/start-pre-install.injectable";
import { Disposer, downloadFile } from "../../../common/utils";
import { InputValidators } from "../input";
import { getMessageFromError } from "./get-message-from-error/get-message-from-error";
import logger from "../../../main/logger";
import { Notifications } from "../notifications";
import path from "path";
import { readFileNotify } from "./read-file-notify/read-file-notify";
import type { InstallRequest } from "./attempt-install/install-request";
import type { ExtensionInfo } from "./attempt-install-by-info/attempt-install-by-info";

interface Dependencies {
  attemptInstall: (request: InstallRequest, disposer: Disposer) => Promise<void>,
  attemptInstallByInfo: (extensionInfo: ExtensionInfo, disposer: Disposer) => Promise<void>,
  startPreInstall: () => Disposer;
}

const installFromInput = ({ attemptInstall, attemptInstallByInfo, startPreInstall }: Dependencies) => (
  async (input: string) => {
    const disposer = startPreInstall();

    try {
      // fixme: improve error messages for non-tar-file URLs
      if (InputValidators.isUrl.validate(input)) {
        // install via url
        const { promise } = downloadFile({ url: input, timeout: 10 * 60 * 1000 });
        const fileName = path.basename(input);

        await attemptInstall({ fileName, dataP: promise }, disposer);
      } else if (InputValidators.isPath.validate(input)) {
        // install from system path
        const fileName = path.basename(input);

        await attemptInstall({ fileName, dataP: readFileNotify(input) }, disposer);
      } else if (InputValidators.isExtensionNameInstall.validate(input)) {
        const [{ groups: { name, version }}] = [...input.matchAll(InputValidators.isExtensionNameInstallRegex)];

        await attemptInstallByInfo({ name, version }, disposer);
      } else {
        throw new Error("unknown input format");
      }
    } catch (error) {
      const message = getMessageFromError(error);

      logger.info(`[EXTENSION-INSTALL]: installation has failed: ${message}`, { error, installPath: input });
      Notifications.error(<p>Installation has failed: <b>{message}</b></p>);
    } finally {
      disposer();
    }
  }
);

const installFromInputInjectable = getInjectable({
  instantiate: (di) =>
    installFromInput({
      attemptInstall: di.inject(attemptInstallInjectable),
      attemptInstallByInfo: di.inject(attemptInstallByInfoInjectable),
      startPreInstall: di.inject(startPreInstallInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default installFromInputInjectable;
