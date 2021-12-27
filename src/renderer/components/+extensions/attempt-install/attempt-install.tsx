/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {
  Disposer,
  disposer,
  ExtendableDisposer,
} from "../../../../common/utils";
import {
  ExtensionInstallationState,
  ExtensionInstallationStateStore,
} from "../extension-install.store";
import { Notifications } from "../../notifications";
import { Button } from "../../button";
import type { ExtensionLoader } from "../../../../extensions/extension-loader";
import type { LensExtensionId } from "../../../../extensions/lens-extension";
import React from "react";
import fse from "fs-extra";
import { shell } from "electron";
import {
  createTempFilesAndValidate,
  InstallRequestValidated,
} from "./create-temp-files-and-validate/create-temp-files-and-validate";
import { getExtensionDestFolder } from "./get-extension-dest-folder/get-extension-dest-folder";
import type { InstallRequest } from "./install-request";

interface Dependencies {
  extensionLoader: ExtensionLoader;
  uninstallExtension: (id: LensExtensionId) => Promise<boolean>;
  unpackExtension: (
    request: InstallRequestValidated,
    disposeDownloading: Disposer,
  ) => Promise<void>;
}

export const attemptInstall =
  ({ extensionLoader, uninstallExtension, unpackExtension }: Dependencies) =>
    async (request: InstallRequest, d?: ExtendableDisposer): Promise<void> => {
      const dispose = disposer(
        ExtensionInstallationStateStore.startPreInstall(),
        d,
      );

      const validatedRequest = await createTempFilesAndValidate(request);

      if (!validatedRequest) {
        return dispose();
      }

      const { name, version, description } = validatedRequest.manifest;
      const curState = ExtensionInstallationStateStore.getInstallationState(
        validatedRequest.id,
      );

      if (curState !== ExtensionInstallationState.IDLE) {
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
      const folderExists = await fse.pathExists(extensionFolder);

      if (!folderExists) {
      // install extension if not yet exists
        await unpackExtension(validatedRequest, dispose);
      } else {
        const {
          manifest: { version: oldVersion },
        } = extensionLoader.getExtension(validatedRequest.id);

        // otherwise confirmation required (re-install / update)
        const removeNotification = Notifications.info(
          <div className="InstallingExtensionNotification flex gaps align-center">
            <div className="flex column gaps">
              <p>
              Install extension{" "}
                <b>
                  {name}@{version}
                </b>
              ?
              </p>
              <p>
              Description: <em>{description}</em>
              </p>
              <div
                className="remove-folder-warning"
                onClick={() => shell.openPath(extensionFolder)}
              >
                <b>Warning:</b> {name}@{oldVersion} will be removed before
              installation.
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
      }
    };
