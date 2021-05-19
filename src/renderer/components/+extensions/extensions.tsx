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
import { remote, shell } from "electron";
import fse from "fs-extra";
import { computed, observable, reaction, when } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import os from "os";
import path from "path";
import React from "react";
import { autobind, disposer, Disposer, downloadFile, downloadJson, ExtendableDisposer, extractTar, listTarEntries, noop, readFileFromTar } from "../../../common/utils";
import { docsUrl } from "../../../common/vars";
import { ExtensionDiscovery, InstalledExtension, manifestFilename } from "../../../extensions/extension-discovery";
import { ExtensionLoader } from "../../../extensions/extension-loader";
import { extensionDisplayName, LensExtensionId, LensExtensionManifest, sanitizeExtensionName } from "../../../extensions/lens-extension";
import logger from "../../../main/logger";
import { prevDefault } from "../../utils";
import { Button } from "../button";
import { ConfirmDialog } from "../confirm-dialog";
import { Icon } from "../icon";
import { DropFileInput, Input, InputValidator, InputValidators, SearchInput } from "../input";
import { PageLayout } from "../layout/page-layout";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { Spinner } from "../spinner/spinner";
import { TooltipPosition } from "../tooltip";
import { ExtensionInstallationState, ExtensionInstallationStateStore } from "./extension-install.store";
import URLParse from "url-parse";
import { SemVer } from "semver";
import _ from "lodash";

function getMessageFromError(error: any): string {
  if (!error || typeof error !== "object") {
    return "an error has occured";
  }

  if (error.message) {
    return String(error.message);
  }

  if (error.err) {
    return String(error.err);
  }

  const rawMessage = String(error);

  if (rawMessage === String({})) {
    return "an error has occured";
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
      <p>Extension <b>{displayName}</b> successfully uninstalled!</p>
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

  if(!firstFile) {
    throw new Error(`invalid extension bundle,  ${manifestFilename} not found`);
  }

  const rootFolder = path.normalize(firstFile).split(path.sep)[0];
  const packedInRootFolder = tarFiles.every(entry => entry.startsWith(rootFolder));
  const manifestLocation = packedInRootFolder ? path.join(rootFolder, manifestFilename) : manifestFilename;

  if(!tarFiles.includes(manifestLocation)) {
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
      </div>
    );
  }

  return null;
}

async function unpackExtension(request: InstallRequestValidated, disposeDownloading?: Disposer) {
  const { id, fileName, tempFile, manifest: { name, version } } = request;

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
    ExtensionLoader.getInstance().userExtensions.get(id).isEnabled = true;

    Notifications.ok(
      <p>Extension <b>{displayName}</b> successfully installed!</p>
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
      Notifications.error(<p>The <em>{name}</em> extension does not have a v{version}.</p>);

      return disposer();
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
      </div>
    );
  }

  const extensionFolder = getExtensionDestFolder(name);
  const folderExists = await fse.pathExists(extensionFolder);

  if (!folderExists) {
    // install extension if not yet exists
    await unpackExtension(validatedRequest, dispose);
  } else {
    const { manifest: { version: oldVersion } } = ExtensionLoader.getInstance().getExtension(validatedRequest.id);

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
        }} />
      </div>,
      {
        onClose: dispose,
      }
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
  const { dialog, BrowserWindow, app } = remote;
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    defaultPath: app.getPath("downloads"),
    properties: ["openFile", "multiSelections"],
    message: `Select extensions to install (formats: ${supportedFormats.join(", ")}), `,
    buttonLabel: "Use configuration",
    filters: [
      { name: "tarball", extensions: supportedFormats }
    ]
  });

  if (!canceled) {
    await attemptInstalls(filePaths);
  }
}

@observer
export class Extensions extends React.Component {
  private static installInputValidators = [
    InputValidators.isUrl,
    InputValidators.isPath,
    InputValidators.isExtensionNameInstall,
  ];

  private static installInputValidator: InputValidator = {
    message: "Invalid URL, absolute path, or extension name",
    validate: (value: string) => (
      Extensions.installInputValidators.some(({ validate }) => validate(value))
    ),
  };

  @observable search = "";
  @observable installPath = "";

  @computed get searchedForExtensions() {
    const searchText = this.search.toLowerCase();

    return Array.from(ExtensionLoader.getInstance().userExtensions.values())
      .filter(({ manifest: { name, description }}) => (
        name.toLowerCase().includes(searchText)
        || description?.toLowerCase().includes(searchText)
      ));
  }

  componentDidMount() {
    // TODO: change this after upgrading to mobx6 as that versions' reactions have this functionality
    let prevSize = ExtensionLoader.getInstance().userExtensions.size;

    disposeOnUnmount(this, [
      reaction(() => ExtensionLoader.getInstance().userExtensions.size, curSize => {
        try {
          if (curSize > prevSize) {
            when(() => !ExtensionInstallationStateStore.anyInstalling)
              .then(() => this.installPath = "");
          }
        } finally {
          prevSize = curSize;
        }
      })
    ]);
  }

  renderNoExtensionsHelpText() {
    if (this.search) {
      return <p>No search results found</p>;
    }

    return (
      <p>
        There are no installed extensions.
        See list of <a href="https://github.com/lensapp/lens-extensions/blob/main/README.md" target="_blank" rel="noreferrer">available extensions</a>.
      </p>
    );
  }

  renderNoExtensions() {
    return (
      <div className="no-extensions flex box gaps justify-center">
        <Icon material="info" />
        <div>
          {this.renderNoExtensionsHelpText()}
        </div>
      </div>
    );
  }

  @autobind()
  renderExtension(extension: InstalledExtension) {
    const { id, isEnabled, manifest } = extension;
    const { name, description, version } = manifest;
    const isUninstalling = ExtensionInstallationStateStore.isExtensionUninstalling(id);

    return (
      <div key={id} className="extension flex gaps align-center">
        <div className="box grow">
          <h5>{name}</h5>
          <h6>{version}</h6>
          <p>{description}</p>
        </div>
        <div className="actions">
          {
            isEnabled
              ? <Button accent disabled={isUninstalling} onClick={() => extension.isEnabled = false}>Disable</Button>
              : <Button plain active disabled={isUninstalling} onClick={() => extension.isEnabled = true}>Enable</Button>
          }
          <Button
            plain
            active
            disabled={isUninstalling}
            waiting={isUninstalling}
            onClick={() => confirmUninstallExtension(extension)}
          >
            Uninstall
          </Button>
        </div>
      </div>
    );
  }

  renderExtensions() {
    if (!ExtensionDiscovery.getInstance().isLoaded) {
      return <div className="spinner-wrapper"><Spinner /></div>;
    }

    const { searchedForExtensions } = this;

    if (!searchedForExtensions.length) {
      return this.renderNoExtensions();
    }

    return (
      <>
        {...searchedForExtensions.map(this.renderExtension)}
      </>
    );
  }

  render() {
    const { installPath } = this;

    return (
      <DropFileInput onDropFiles={installOnDrop}>
        <PageLayout showOnTop className="Extensions" contentGaps={false}>
          <h2>Lens Extensions</h2>
          <div>
            Add new features and functionality via Lens Extensions.
            Check out documentation to <a href={`${docsUrl}/latest/extensions/usage/`} target="_blank" rel="noreferrer">learn more</a> or see the list of <a href="https://github.com/lensapp/lens-extensions/blob/main/README.md" target="_blank" rel="noreferrer">available extensions</a>.
          </div>

          <div className="install-extension flex column gaps">
            <SubTitle title="Install Extension:"/>
            <div className="extension-input flex box gaps align-center">
              <Input
                className="box grow"
                theme="round-black"
                disabled={ExtensionInstallationStateStore.anyPreInstallingOrInstalling}
                placeholder={`Name or file path or URL to an extension package (${supportedFormats.join(", ")})`}
                showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
                validators={installPath ? Extensions.installInputValidator : undefined}
                value={installPath}
                onChange={value => this.installPath = value}
                onSubmit={() => installFromInput(this.installPath)}
                iconLeft="link"
                iconRight={
                  <Icon
                    interactive
                    material="folder"
                    onClick={prevDefault(installFromSelectFileDialog)}
                    tooltip="Browse"
                  />
                }
              />
            </div>
            <Button
              primary
              label="Install"
              disabled={ExtensionInstallationStateStore.anyPreInstallingOrInstalling || !Extensions.installInputValidator.validate(installPath)}
              waiting={ExtensionInstallationStateStore.anyPreInstallingOrInstalling}
              onClick={() => installFromInput(this.installPath)}
            />
            <small className="hint">
              <b>Pro-Tip</b>: you can also drag-n-drop tarball-file to this area
            </small>
          </div>

          <h2>Installed Extensions</h2>
          <div className="installed-extensions flex column gaps">
            <SearchInput
              placeholder="Search installed extensions by name or description"
              value={this.search}
              onChange={(value) => this.search = value}
            />
            {this.renderExtensions()}
          </div>
        </PageLayout>
      </DropFileInput>
    );
  }
}
