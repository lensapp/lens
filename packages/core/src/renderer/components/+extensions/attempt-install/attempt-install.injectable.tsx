/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import uninstallExtensionInjectable from "../uninstall-extension.injectable";
import unpackExtensionInjectable from "./unpack-extension.injectable";
import getExtensionDestFolderInjectable from "./get-extension-dest-folder.injectable";
import createTempFilesAndValidateInjectable from "./create-temp-files-and-validate.injectable";
import type { Disposer } from "../../../../common/utils";
import { disposer } from "../../../../common/utils";
import { Button } from "../../button";
import React from "react";
import { remove as removeDir } from "fs-extra";
import { shell } from "electron";
import showErrorNotificationInjectable from "../../notifications/show-error-notification.injectable";
import showInfoNotificationInjectable from "../../notifications/show-info-notification.injectable";
import getInstalledExtensionInjectable from "../../../../features/extensions/common/get-installed-extension.injectable";
import startPreInstallPhaseInjectable from "../../../../features/extensions/installation-states/renderer/start-pre-install-phase.injectable";
import getExtensionInstallationPhaseInjectable from "../../../../features/extensions/installation-states/renderer/get-phase.injectable";

export interface InstallRequest {
  fileName: string;
  data: Buffer;
}

export type AttemptInstall = (request: InstallRequest, cleanup?: Disposer) => Promise<void>;

const attemptInstallInjectable = getInjectable({
  id: "attempt-install",
  instantiate: (di): AttemptInstall => {
    const uninstallExtension = di.inject(uninstallExtensionInjectable);
    const unpackExtension = di.inject(unpackExtensionInjectable);
    const createTempFilesAndValidate = di.inject(createTempFilesAndValidateInjectable);
    const getExtensionDestFolder = di.inject(getExtensionDestFolderInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const showInfoNotification = di.inject(showInfoNotificationInjectable);
    const getInstalledExtension = di.inject(getInstalledExtensionInjectable);
    const startPreInstallPhase = di.inject(startPreInstallPhaseInjectable);
    const getExtensionInstallationPhase = di.inject(getExtensionInstallationPhaseInjectable);

    return async (request, cleanup) => {
      const dispose = disposer(
        startPreInstallPhase(),
        cleanup,
      );

      const validatedRequest = await createTempFilesAndValidate(request);

      if (!validatedRequest) {
        return dispose();
      }

      const { name, version, description } = validatedRequest.manifest;
      const curState = getExtensionInstallationPhase(validatedRequest.id);

      if (curState !== "idle") {
        dispose();

        return void showErrorNotification(
          <div className="flex column gaps">
            <b>Extension Install Collision:</b>
            <p>
              {"The "}
              <em>{name}</em>
              {` extension is currently ${curState.toLowerCase()}.`}
            </p>
            <p>Will not proceed with this current install request.</p>
          </div>,
        );
      }

      const extensionFolder = getExtensionDestFolder(name);
      const installedExtension = getInstalledExtension(validatedRequest.id);

      if (installedExtension) {
        const { version: oldVersion } = installedExtension.manifest;

        // confirm to uninstall old version before installing new version
        const removeNotification = showInfoNotification(
          <div className="InstallingExtensionNotification flex gaps align-center">
            <div className="flex column gaps">
              <p>
                {"Install extension "}
                <b>{`${name}@${version}`}</b>
                ?
              </p>
              <p>
                {"Description: "}
                <em>{description}</em>
              </p>
              <div
                className="remove-folder-warning"
                onClick={() => shell.openPath(extensionFolder)}
              >
                <b>Warning:</b>
                {` ${name}@${oldVersion} will be removed before installation.`}
              </div>
            </div>
            <Button
              autoFocus
              label="Install"
              onClick={async () => {
                removeNotification();

                if (await uninstallExtension(validatedRequest.id)) {
                  await unpackExtension(validatedRequest, dispose);
                } else {
                  dispose();
                }
              }}
            />
          </div>,
          {
            onClose: dispose,
          },
        );
      } else {
        // clean up old data if still around
        await removeDir(extensionFolder);

        // install extension if not yet exists
        await unpackExtension(validatedRequest, dispose);
      }
    };
  },
});

export default attemptInstallInjectable;
