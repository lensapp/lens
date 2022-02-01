/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Disposer } from "../../../../common/utils";
import { Notifications } from "../../notifications";
import { Button } from "../../button";
import type { LensExtensionId } from "../../../../extensions/lens-extension";
import React from "react";
import { shell } from "electron";
import type { InstallRequestValidated } from "./create-temp-files-and-validate/create-temp-files-and-validate";
import type { InstallRequest } from "./install-request";
import { InstallationState } from "../../../../extensions/installation-state/state";
import type { InstalledExtension } from "../../../../extensions/extension-discovery/extension-discovery";

interface Dependencies {
  getInstalledExtension: (extId: string) => InstalledExtension | undefined;
  uninstallExtension: (id: LensExtensionId) => Promise<boolean>;
  unpackExtension: (request: InstallRequestValidated, disposeDownloading: Disposer) => Promise<void>;
  createTempFilesAndValidate: (installRequest: InstallRequest) => Promise<InstallRequestValidated | null>;
  getExtensionDestFolder: (name: string) => string;
  getInstallationState: (extId: string) => InstallationState;
  removeDir: (dir: string) => Promise<void>;
}

export const attemptInstall =
  ({
    getInstalledExtension,
    uninstallExtension,
    unpackExtension,
    createTempFilesAndValidate,
    getExtensionDestFolder,
    getInstallationState,
    removeDir,
  }: Dependencies) =>
    async (request: InstallRequest, dispose: Disposer): Promise<void> => {
      const validatedRequest = await createTempFilesAndValidate(request);

      if (!validatedRequest) {
        return dispose();
      }

      const {
        id,
        manifest: { name, version, description },
      } = validatedRequest;
      const curState = getInstallationState(id);

      if (curState !== InstallationState.IDLE) {
        dispose();

        return void Notifications.error(
          <div className="flex column gaps">
            <b>Extension Install Collision:</b>
            <p>
            The <em>{name}</em> extension is currently {curState.toLowerCase()}.
            </p>
            <p>Will not proceed with this current install request.</p>
          </div>,
        );
      }

      const extensionFolder = getExtensionDestFolder(name);
      const installedExtension = getInstalledExtension(id);

      if (installedExtension) {
        const { manifest: { version: oldVersion }} = installedExtension;

        // confirm uninstall and then install new version
        const removeNotification = Notifications.info(
          <div className="InstallingExtensionNotification flex gaps align-center">
            <div className="flex column gaps">
              <p>
                Install extension<b>{name}@{version}</b>?
              </p>
              <p>
                Description: <em>{description}</em>
              </p>
              <div
                className="remove-folder-warning"
                onClick={() => shell.openPath(extensionFolder)}
              >
                <b>Warning:</b> {name}@{oldVersion} will be removed before installation.
              </div>
            </div>
            <Button
              autoFocus
              label="Install"
              onClick={async () => {
                removeNotification();

                if (await uninstallExtension(id)) {
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
        // Remove the old dir because it isn't a valid extension anyway
        await removeDir(extensionFolder);
        await unpackExtension(validatedRequest, dispose);
      }
    };
