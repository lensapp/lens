/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import uninstallExtensionInjectable from "../uninstall-extension/uninstall-extension.injectable";
import type { UnpackExtension } from "./unpack-extension.injectable";
import unpackExtensionInjectable from "./unpack-extension.injectable";
import type { GetExtensionDestFolder } from "./get-extension-dest-folder.injectable";
import getExtensionDestFolderInjectable from "./get-extension-dest-folder.injectable";
import type { CreateTempFilesAndValidate } from "./create-temp-files-and-validate.injectable";
import createTempFilesAndValidateInjectable from "./create-temp-files-and-validate.injectable";
import extensionInstallationStateStoreInjectable from "../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import type { Disposer } from "../../../../common/utils";
import { disposer } from "../../../../common/utils";
import { Notifications } from "../../notifications";
import { Button } from "../../button";
import type { ExtensionLoader } from "../../../../extensions/extension-loader";
import type { LensExtensionId } from "../../../../extensions/lens-extension";
import React from "react";
import { remove as removeDir } from "fs-extra";
import { shell } from "electron";
import type { ExtensionInstallationStateStore } from "../../../../extensions/extension-installation-state-store/extension-installation-state-store";
import { ExtensionInstallationState } from "../../../../extensions/extension-installation-state-store/extension-installation-state-store";

export interface InstallRequest {
  fileName: string;
  data: Buffer;
}

interface Dependencies {
  extensionLoader: ExtensionLoader;
  uninstallExtension: (id: LensExtensionId) => Promise<boolean>;
  unpackExtension: UnpackExtension;
  createTempFilesAndValidate: CreateTempFilesAndValidate;
  getExtensionDestFolder: GetExtensionDestFolder;
  installStateStore: ExtensionInstallationStateStore;
}

export type AttemptInstall = (request: InstallRequest, cleanup?: Disposer) => Promise<void>;

const attemptInstall = ({
  extensionLoader,
  uninstallExtension,
  unpackExtension,
  createTempFilesAndValidate,
  getExtensionDestFolder,
  installStateStore,
}: Dependencies): AttemptInstall =>
  async (request, cleanup) => {
    const dispose = disposer(
      installStateStore.startPreInstall(),
      cleanup,
    );

    const validatedRequest = await createTempFilesAndValidate(request);

    if (!validatedRequest) {
      return dispose();
    }

    const { name, version, description } = validatedRequest.manifest;
    const curState = installStateStore.getInstallationState(validatedRequest.id);

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

const attemptInstallInjectable = getInjectable({
  id: "attempt-install",
  instantiate: (di) => attemptInstall({
    extensionLoader: di.inject(extensionLoaderInjectable),
    uninstallExtension: di.inject(uninstallExtensionInjectable),
    unpackExtension: di.inject(unpackExtensionInjectable),
    createTempFilesAndValidate: di.inject(createTempFilesAndValidateInjectable),
    getExtensionDestFolder: di.inject(getExtensionDestFolderInjectable),
    installStateStore: di.inject(extensionInstallationStateStoreInjectable),
  }),
});

export default attemptInstallInjectable;
