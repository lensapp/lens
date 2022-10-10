/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ExtendableDisposer } from "../../../../common/utils";
import { disposer } from "../../../../common/utils";
import { Notifications } from "../../notifications";
import { Button } from "../../button";
import type { ExtensionLoader } from "../../../../extensions/extension-loader";
import type { LensExtensionId } from "../../../../extensions/lens-extension";
import React from "react";
import { remove as removeDir } from "fs-extra";
import { shell } from "electron";
import type { InstallRequest } from "./install-request";
import type { ExtensionInstallationStateStore } from "../../../../extensions/extension-installation-state-store/extension-installation-state-store";
import { ExtensionInstallationState } from "../../../../extensions/extension-installation-state-store/extension-installation-state-store";
import type { UnpackExtension } from "./unpack-extension/unpack-extension.injectable";
import type { CreateTempFilesAndValidate } from "./create-temp-files-and-validate/create-temp-files-and-validate.injectable";
import type { GetExtensionDestFolder } from "./get-extension-dest-folder/get-extension-dest-folder.injectable";

interface Dependencies {
  extensionLoader: ExtensionLoader;
  uninstallExtension: (id: LensExtensionId) => Promise<boolean>;
  unpackExtension: UnpackExtension;
  createTempFilesAndValidate: CreateTempFilesAndValidate;
  getExtensionDestFolder: GetExtensionDestFolder;
  extensionInstallationStateStore: ExtensionInstallationStateStore;
}

export const attemptInstall =
  ({
    extensionLoader,
    uninstallExtension,
    unpackExtension,
    createTempFilesAndValidate,
    getExtensionDestFolder,
    extensionInstallationStateStore,
  }: Dependencies) =>
    async (request: InstallRequest, d?: ExtendableDisposer): Promise<void> => {
      console.log("Attempting to install extension");

      const dispose = disposer(
        extensionInstallationStateStore.startPreInstall(),
        d,
      );

      const validatedRequest = await createTempFilesAndValidate(request);

      if (!validatedRequest) {
        return dispose();
      }

      const { name, version, description } = validatedRequest.manifest;
      const curState = extensionInstallationStateStore.getInstallationState(
        validatedRequest.id,
      );

      if (curState !== ExtensionInstallationState.IDLE) {
        dispose();

        return void Notifications.error(
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
      const installedExtension = extensionLoader.getExtension(validatedRequest.id);

      if (installedExtension) {
        const { version: oldVersion } = installedExtension.manifest;

        // confirm to uninstall old version before installing new version
        const removeNotification = Notifications.info(
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
