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

import "./extensions.scss";

import { shell } from "electron";
import fse from "fs-extra";
import _ from "lodash";
import { makeObservable, observable, reaction, when } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import os from "os";
import path from "path";
import React from "react";
import { SemVer } from "semver";
import URLParse from "url-parse";
import { Disposer, disposer, downloadFile, downloadJson, ExtendableDisposer, extractTar, listTarEntries, noop, readFileFromTar } from "../../../common/utils";
import { ExtensionDiscovery, InstalledExtension, manifestFilename } from "../../../extensions/extension-discovery";
import { ExtensionLoader } from "../../../extensions/extension-loader";
import { extensionDisplayName, LensExtensionId, LensExtensionManifest, sanitizeExtensionName } from "../../../extensions/lens-extension";
import logger from "../../../main/logger";
import { Button } from "../button";
import { ConfirmDialog } from "../confirm-dialog";
import { DropFileInput, InputValidators } from "../input";
import { Notifications } from "../notifications";
import { ExtensionInstallationState, ExtensionInstallationStateStore } from "./extension-install.store";
import { Install } from "./install";
import { InstalledExtensions } from "./installed-extensions";
import { Notice } from "./notice";
import { SettingLayout } from "../layout/setting-layout";
import { docsUrl } from "../../../common/vars";
import { dialog } from "../../remote-helpers";
import { AppPaths } from "../../../common/app-paths";

function getMessageFromError(error: any): string {
  if (!error || typeof error !== "object") {
    return "an error has occurred";
  }

  if (error.message) {
    return String(error.message);
  }

  if (error.err) {
    return String(error.err);
  }

  const rawMessage = String(error);

  if (rawMessage === String({})) {
    return "an error has occurred";
  }

  return rawMessage;
}

interface ExtensionInfo {
  name: string;
  version?: string;
  requireConfirmation?: boolean;
}

interface InstallRequest {
  fileName: string;
  dataP: Promise<Buffer | null>;
}

interface InstallRequestValidated {
  fileName: string;
  data: Buffer;
  id: LensExtensionId;
  manifest: LensExtensionManifest;
  tempFile: string; // temp system path to packed extension for unpacking
}

function setExtensionEnabled(id: LensExtensionId, isEnabled: boolean): void {
  const extension = ExtensionLoader.getInstance().getExtension(id);

  if (extension) {
    extension.isEnabled = isEnabled;
  }
}

function enableExtension(id: LensExtensionId) {
  setExtensionEnabled(id, true);
}

function disableExtension(id: LensExtensionId) {
  setExtensionEnabled(id, false);
}

async function uninstallExtension(extensionId: LensExtensionId): Promise<boolean> {
  const loader = ExtensionLoader.getInstance();
  const { manifest } = loader.getExtension(extensionId);
  const displayName = extensionDisplayName(manifest.name, manifest.version);

  try {
    logger.debug(`[EXTENSIONS]: trying to uninstall ${extensionId}`);
    ExtensionInstallationStateStore.setUninstalling(extensionId);

    await ExtensionDiscovery.getInstance().uninstallExtension(extensionId);

    // wait for the ExtensionLoader to actually uninstall the extension
    await when(() => !loader.userExtensions.has(extensionId));

    Notifications.ok(
      <p>Extension <b>{displayName}</b> successfully uninstalled!</p>,
    );

    return true;
  } catch (error) {
    const message = getMessageFromError(error);

    logger.info(`[EXTENSION-UNINSTALL]: uninstalling ${displayName} has failed: ${error}`, { error });
    Notifications.error(<p>Uninstalling extension <b>{displayName}</b> has failed: <em>{message}</em></p>);

    return false;
  } finally {
    // Remove uninstall state on uninstall failure
    ExtensionInstallationStateStore.clearUninstalling(extensionId);
  }
}

async function confirmUninstallExtension(extension: InstalledExtension): Promise<void> {
  const displayName = extensionDisplayName(extension.manifest.name, extension.manifest.version);
  const confirmed = await ConfirmDialog.confirm({
    message: <p>Are you sure you want to uninstall extension <b>{displayName}</b>?</p>,
    labelOk: "Yes",
    labelCancel: "No",
  });

  if (confirmed) {
    await uninstallExtension(extension.id);
  }
}

function getExtensionDestFolder(name: string) {
  return path.join(ExtensionDiscovery.getInstance().localFolderPath, sanitizeExtensionName(name));
}

function getExtensionPackageTemp(fileName = "") {
  return path.join(os.tmpdir(), "lens-extensions", fileName);
}

async function readFileNotify(filePath: string, showError = true): Promise<Buffer | null> {
  try {
    return await fse.readFile(filePath);
  } catch (error) {
    if (showError) {
      const message = getMessageFromError(error);

      logger.info(`[EXTENSION-INSTALL]: preloading ${filePath} has failed: ${message}`, { error });
      Notifications.error(`Error while reading "${filePath}": ${message}`);
    }
  }

  return null;
}

async function validatePackage(filePath: string): Promise<LensExtensionManifest> {
  const tarFiles = await listTarEntries(filePath);

  // tarball from npm contains single root folder "package/*"
  const firstFile = tarFiles[0];

  if (!firstFile) {
    throw new Error(`invalid extension bundle,  ${manifestFilename} not found`);
  }

  const rootFolder = path.normalize(firstFile).split(path.sep)[0];
  const packedInRootFolder = tarFiles.every(entry => entry.startsWith(rootFolder));
  const manifestLocation = packedInRootFolder ? path.join(rootFolder, manifestFilename) : manifestFilename;

  if (!tarFiles.includes(manifestLocation)) {
    throw new Error(`invalid extension bundle, ${manifestFilename} not found`);
  }

  const manifest = await readFileFromTar<LensExtensionManifest>({
    tarPath: filePath,
    filePath: manifestLocation,
    parseJson: true,
  });

  if (!manifest.main && !manifest.renderer) {
    throw new Error(`${manifestFilename} must specify "main" and/or "renderer" fields`);
  }

  return manifest;
}

async function createTempFilesAndValidate({ fileName, dataP }: InstallRequest): Promise<InstallRequestValidated | null> {
  // copy files to temp
  await fse.ensureDir(getExtensionPackageTemp());

  // validate packages
  const tempFile = getExtensionPackageTemp(fileName);

  try {
    const data = await dataP;

    if (!data) {
      return null;
    }

    await fse.writeFile(tempFile, data);
    const manifest = await validatePackage(tempFile);
    const id = path.join(ExtensionDiscovery.getInstance().nodeModulesPath, manifest.name, "package.json");

    return {
      fileName,
      data,
      manifest,
      tempFile,
      id,
    };
  } catch (error) {
    const message = getMessageFromError(error);

    logger.info(`[EXTENSION-INSTALLATION]: installing ${fileName} has failed: ${message}`, { error });
    Notifications.error(
      <div className="flex column gaps">
        <p>Installing <em>{fileName}</em> has failed, skipping.</p>
        <p>Reason: <em>{message}</em></p>
      </div>,
    );
  }

  return null;
}

async function unpackExtension(request: InstallRequestValidated, disposeDownloading?: Disposer) {
  const { id, fileName, tempFile, manifest: { name, version }} = request;

  ExtensionInstallationStateStore.setInstalling(id);
  disposeDownloading?.();

  const displayName = extensionDisplayName(name, version);
  const extensionFolder = getExtensionDestFolder(name);
  const unpackingTempFolder = path.join(path.dirname(tempFile), `${path.basename(tempFile)}-unpacked`);

  logger.info(`Unpacking extension ${displayName}`, { fileName, tempFile });

  try {
    // extract to temp folder first
    await fse.remove(unpackingTempFolder).catch(noop);
    await fse.ensureDir(unpackingTempFolder);
    await extractTar(tempFile, { cwd: unpackingTempFolder });

    // move contents to extensions folder
    const unpackedFiles = await fse.readdir(unpackingTempFolder);
    let unpackedRootFolder = unpackingTempFolder;

    if (unpackedFiles.length === 1) {
      // check if %extension.tgz was packed with single top folder,
      // e.g. "npm pack %ext_name" downloads file with "package" root folder within tarball
      unpackedRootFolder = path.join(unpackingTempFolder, unpackedFiles[0]);
    }

    await fse.ensureDir(extensionFolder);
    await fse.move(unpackedRootFolder, extensionFolder, { overwrite: true });

    // wait for the loader has actually install it
    await when(() => ExtensionLoader.getInstance().userExtensions.has(id));

    // Enable installed extensions by default.
    ExtensionLoader.getInstance().setIsEnabled(id, true);

    Notifications.ok(
      <p>Extension <b>{displayName}</b> successfully installed!</p>,
    );
  } catch (error) {
    const message = getMessageFromError(error);

    logger.info(`[EXTENSION-INSTALLATION]: installing ${request.fileName} has failed: ${message}`, { error });
    Notifications.error(<p>Installing extension <b>{displayName}</b> has failed: <em>{message}</em></p>);
  } finally {
    // Remove install state once finished
    ExtensionInstallationStateStore.clearInstalling(id);

    // clean up
    fse.remove(unpackingTempFolder).catch(noop);
    fse.unlink(tempFile).catch(noop);
  }
}

export async function attemptInstallByInfo({ name, version, requireConfirmation = false }: ExtensionInfo) {
  const disposer = ExtensionInstallationStateStore.startPreInstall();
  const registryUrl = new URLParse("https://registry.npmjs.com").set("pathname", name).toString();
  const { promise } = downloadJson({ url: registryUrl });
  const json = await promise.catch(console.error);

  if (!json || json.error || typeof json.versions !== "object" || !json.versions) {
    const message = json?.error ? `: ${json.error}` : "";

    Notifications.error(`Failed to get registry information for that extension${message}`);

    return disposer();
  }

  if (version) {
    if (!json.versions[version]) {
      if (json["dist-tags"][version]) {
        version = json["dist-tags"][version];
      } else {
        Notifications.error(<p>The <em>{name}</em> extension does not have a version or tag <code>{version}</code>.</p>);

        return disposer();
      }
    }
  } else {
    const versions = Object.keys(json.versions)
      .map(version => new SemVer(version, { loose: true, includePrerelease: true }))
      // ignore pre-releases for auto picking the version
      .filter(version => version.prerelease.length === 0);

    version = _.reduce(versions, (prev, curr) => (
      prev.compareMain(curr) === -1
        ? curr
        : prev
    )).format();
  }

  if (requireConfirmation) {
    const proceed = await ConfirmDialog.confirm({
      message: <p>Are you sure you want to install <b>{name}@{version}</b>?</p>,
      labelCancel: "Cancel",
      labelOk: "Install",
    });

    if (!proceed) {
      return disposer();
    }
  }

  const url = json.versions[version].dist.tarball;
  const fileName = path.basename(url);
  const { promise: dataP } = downloadFile({ url, timeout: 10 * 60 * 1000 });

  return attemptInstall({ fileName, dataP }, disposer);
}

async function attemptInstall(request: InstallRequest, d?: ExtendableDisposer): Promise<void> {
  const dispose = disposer(ExtensionInstallationStateStore.startPreInstall(), d);
  const validatedRequest = await createTempFilesAndValidate(request);

  if (!validatedRequest) {
    return dispose();
  }

  const { name, version, description } = validatedRequest.manifest;
  const curState = ExtensionInstallationStateStore.getInstallationState(validatedRequest.id);

  if (curState !== ExtensionInstallationState.IDLE) {
    dispose();

    return Notifications.error(
      <div className="flex column gaps">
        <b>Extension Install Collision:</b>
        <p>The <em>{name}</em> extension is currently {curState.toLowerCase()}.</p>
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
    const { manifest: { version: oldVersion }} = ExtensionLoader.getInstance().getExtension(validatedRequest.id);

    // otherwise confirmation required (re-install / update)
    const removeNotification = Notifications.info(
      <div className="InstallingExtensionNotification flex gaps align-center">
        <div className="flex column gaps">
          <p>Install extension <b>{name}@{version}</b>?</p>
          <p>Description: <em>{description}</em></p>
          <div className="remove-folder-warning" onClick={() => shell.openPath(extensionFolder)}>
            <b>Warning:</b> {name}@{oldVersion} will be removed before installation.
          </div>
        </div>
        <Button autoFocus label="Install" onClick={async () => {
          removeNotification();

          if (await uninstallExtension(validatedRequest.id)) {
            await unpackExtension(validatedRequest, dispose);
          } else {
            dispose();
          }
        }}/>
      </div>,
      {
        onClose: dispose,
      },
    );
  }
}

async function attemptInstalls(filePaths: string[]): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const filePath of filePaths) {
    promises.push(attemptInstall({
      fileName: path.basename(filePath),
      dataP: readFileNotify(filePath),
    }));
  }

  await Promise.allSettled(promises);
}

async function installOnDrop(files: File[]) {
  logger.info("Install from D&D");
  await attemptInstalls(files.map(({ path }) => path));
}

async function installFromInput(input: string) {
  let disposer: ExtendableDisposer | undefined = undefined;

  try {
    // fixme: improve error messages for non-tar-file URLs
    if (InputValidators.isUrl.validate(input)) {
      // install via url
      disposer = ExtensionInstallationStateStore.startPreInstall();
      const { promise } = downloadFile({ url: input, timeout: 10 * 60 * 1000 });
      const fileName = path.basename(input);

      await attemptInstall({ fileName, dataP: promise }, disposer);
    } else if (InputValidators.isPath.validate(input)) {
      // install from system path
      const fileName = path.basename(input);

      await attemptInstall({ fileName, dataP: readFileNotify(input) });
    } else if (InputValidators.isExtensionNameInstall.validate(input)) {
      const [{ groups: { name, version }}] = [...input.matchAll(InputValidators.isExtensionNameInstallRegex)];

      await attemptInstallByInfo({ name, version });
    }
  } catch (error) {
    const message = getMessageFromError(error);

    logger.info(`[EXTENSION-INSTALL]: installation has failed: ${message}`, { error, installPath: input });
    Notifications.error(<p>Installation has failed: <b>{message}</b></p>);
  } finally {
    disposer?.();
  }
}

const supportedFormats = ["tar", "tgz"];

async function installFromSelectFileDialog() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: AppPaths.get("downloads"),
    properties: ["openFile", "multiSelections"],
    message: `Select extensions to install (formats: ${supportedFormats.join(", ")}), `,
    buttonLabel: "Use configuration",
    filters: [
      { name: "tarball", extensions: supportedFormats },
    ],
  });

  if (!canceled) {
    await attemptInstalls(filePaths);
  }
}

interface Props {
}

@observer
export class Extensions extends React.Component<Props> {
  @observable installPath = "";

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => ExtensionLoader.getInstance().userExtensions.size, (curSize, prevSize) => {
        if (curSize > prevSize) {
          disposeOnUnmount(this, [
            when(() => !ExtensionInstallationStateStore.anyInstalling, () => this.installPath = ""),
          ]);
        }
      }),
    ]);
  }

  render() {
    const extensions = Array.from(ExtensionLoader.getInstance().userExtensions.values());

    return (
      <DropFileInput onDropFiles={installOnDrop}>
        <SettingLayout className="Extensions" contentGaps={false}>
          <section>
            <h1>Extensions</h1>

            <Notice className="mb-14 mt-3">
              <p>
                Add new features via Lens Extensions.{" "}
                Check out <a href={`${docsUrl}/extensions/`} target="_blank" rel="noreferrer">docs</a>{" "}
                and list of <a href="https://github.com/lensapp/lens-extensions/blob/main/README.md" target="_blank" rel="noreferrer">available extensions</a>.
              </p>
            </Notice>

            <Install
              supportedFormats={supportedFormats}
              onChange={(value) => this.installPath = value}
              installFromInput={() => installFromInput(this.installPath)}
              installFromSelectFileDialog={installFromSelectFileDialog}
              installPath={this.installPath}
            />

            {extensions.length > 0 && <hr/>}

            <InstalledExtensions
              extensions={extensions}
              enable={enableExtension}
              disable={disableExtension}
              uninstall={confirmUninstallExtension}
            />
          </section>
        </SettingLayout>
      </DropFileInput>
    );
  }
}
