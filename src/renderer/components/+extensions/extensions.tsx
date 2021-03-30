import "./extensions.scss";
import { remote, shell } from "electron";
import fse from "fs-extra";
import { computed, observable, reaction, when } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import os from "os";
import path from "path";
import React from "react";
import { autobind, disposer, Disposer, downloadFile, extractTar, listTarEntries, noop, readFileFromTar } from "../../../common/utils";
import { docsUrl } from "../../../common/vars";
import { extensionDiscovery, InstalledExtension, manifestFilename } from "../../../extensions/extension-discovery";
import { extensionLoader } from "../../../extensions/extension-loader";
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

interface InstallRequest {
  fileName: string;
  filePath?: string;
  data?: Buffer;
}

interface InstallRequestPreloaded extends InstallRequest {
  data: Buffer;
}

interface InstallRequestValidated extends InstallRequestPreloaded {
  id: LensExtensionId;
  manifest: LensExtensionManifest;
  tempFile: string; // temp system path to packed extension for unpacking
}

async function uninstallExtension(extensionId: LensExtensionId, manifest: LensExtensionManifest): Promise<boolean> {
  const displayName = extensionDisplayName(manifest.name, manifest.version);

  try {
    logger.debug(`[EXTENSIONS]: trying to uninstall ${extensionId}`);
    ExtensionInstallationStateStore.setUninstalling(extensionId);

    await extensionDiscovery.uninstallExtension(extensionId);

    // wait for the extensionLoader to actually uninstall the extension
    await when(() => !extensionLoader.userExtensions.has(extensionId));

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

function confirmUninstallExtension(extension: InstalledExtension): void {
  const displayName = extensionDisplayName(extension.manifest.name, extension.manifest.version);

  ConfirmDialog.open({
    message: <p>Are you sure you want to uninstall extension <b>{displayName}</b>?</p>,
    labelOk: "Yes",
    labelCancel: "No",
    ok: () => {
      // Don't want the confirm dialog to stay up longer than the click
      uninstallExtension(extension.id, extension.manifest);
    }
  });
}

function getExtensionDestFolder(name: string) {
  return path.join(extensionDiscovery.localFolderPath, sanitizeExtensionName(name));
}

function getExtensionPackageTemp(fileName = "") {
  return path.join(os.tmpdir(), "lens-extensions", fileName);
}

async function preloadExtension({ fileName, data, filePath }: InstallRequest, { showError = true } = {}): Promise<InstallRequestPreloaded | null> {
  if(data) {
    return { filePath, data, fileName };
  }

  try {
    const data = await fse.readFile(filePath);

    return { filePath, data, fileName };
  } catch(error) {
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

  if (!manifest.lens && !manifest.renderer) {
    throw new Error(`${manifestFilename} must specify "main" and/or "renderer" fields`);
  }

  return manifest;
}

async function createTempFilesAndValidate(request: InstallRequestPreloaded, { showErrors = true } = {}): Promise<InstallRequestValidated | null> {
  // copy files to temp
  await fse.ensureDir(getExtensionPackageTemp());

  // validate packages
  const tempFile = getExtensionPackageTemp(request.fileName);

  try {
    await fse.writeFile(tempFile, request.data);
    const manifest = await validatePackage(tempFile);
    const id = path.join(extensionDiscovery.nodeModulesPath, manifest.name, "package.json");

    return {
      ...request,
      manifest,
      tempFile,
      id,
    };
  } catch (error) {
    fse.unlink(tempFile).catch(noop); // remove invalid temp package

    if (showErrors) {
      const message = getMessageFromError(error);

      logger.info(`[EXTENSION-INSTALLATION]: installing ${request.fileName} has failed: ${message}`, { error });
      Notifications.error(
        <div className="flex column gaps">
          <p>Installing <em>{request.fileName}</em> has failed, skipping.</p>
          <p>Reason: <em>{message}</em></p>
        </div>
      );
    }
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
    await when(() => extensionLoader.userExtensions.has(id));

    // Enable installed extensions by default.
    extensionLoader.userExtensions.get(id).isEnabled = true;

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

/**
 *
 * @param request The information needed to install the extension
 * @param fromUrl The optional URL
 */
async function requestInstall(request: InstallRequest, d?: Disposer): Promise<void> {
  const dispose = disposer(ExtensionInstallationStateStore.startPreInstall(), d);
  const loadedRequest = await preloadExtension(request);

  if (!loadedRequest) {
    return dispose();
  }

  const validatedRequest = await createTempFilesAndValidate(loadedRequest);

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
        <p>Will not procede with this current install request.</p>
      </div>
    );
  }

  const extensionFolder = getExtensionDestFolder(name);
  const folderExists = await fse.pathExists(extensionFolder);

  if (!folderExists) {
    // install extension if not yet exists
    await unpackExtension(validatedRequest, dispose);
  } else {
    // otherwise confirmation required (re-install / update)
    const removeNotification = Notifications.info(
      <div className="InstallingExtensionNotification flex gaps align-center">
        <div className="flex column gaps">
          <p>Install extension <b>{name}@{version}</b>?</p>
          <p>Description: <em>{description}</em></p>
          <div className="remove-folder-warning" onClick={() => shell.openPath(extensionFolder)}>
            <b>Warning:</b> <code>{extensionFolder}</code> will be removed before installation.
          </div>
        </div>
        <Button autoFocus label="Install" onClick={async () => {
          removeNotification();

          if (await uninstallExtension(validatedRequest.id, validatedRequest.manifest)) {
            await unpackExtension(validatedRequest, dispose);
          } else {
            dispose();
          }
        }} />
      </div>,
      {
        onClose() {
          dispose();
        }
      }
    );
  }
}

async function requestInstalls(filePaths: string[]): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const filePath of filePaths) {
    promises.push(requestInstall({
      fileName: path.basename(filePath),
      filePath,
    }));
  }

  await Promise.allSettled(promises);
}

async function installOnDrop(files: File[]) {
  logger.info("Install from D&D");
  await requestInstalls(files.map(({ path }) => path));
}

async function installFromUrlOrPath(installPath: string) {
  const fileName = path.basename(installPath);
  let disposer: Disposer;

  try {
    // install via url
    // fixme: improve error messages for non-tar-file URLs
    if (InputValidators.isUrl.validate(installPath)) {
      disposer = ExtensionInstallationStateStore.startPreInstall();
      const { promise: filePromise } = downloadFile({ url: installPath, timeout: 60000 /*1m*/ });
      const data = await filePromise;

      await requestInstall({ fileName, data }, disposer);
    }
    // otherwise installing from system path
    else if (InputValidators.isPath.validate(installPath)) {
      await requestInstall({ fileName, filePath: installPath });
    }
  } catch (error) {
    const message = getMessageFromError(error);

    logger.info(`[EXTENSION-INSTALL]: installation has failed: ${message}`, { error, installPath });
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
    await requestInstalls(filePaths);
  }
}

@observer
export class Extensions extends React.Component {
  private static installPathValidator: InputValidator = {
    message: "Invalid URL or absolute path",
    validate(value: string) {
      return InputValidators.isUrl.validate(value) || InputValidators.isPath.validate(value);
    }
  };

  @observable search = "";
  @observable installPath = "";

  @computed get searchedForExtensions() {
    const searchText = this.search.toLowerCase();

    return Array.from(extensionLoader.userExtensions.values())
      .filter(({ manifest: { name, description }}) => (
        name.toLowerCase().includes(searchText)
        || description?.toLowerCase().includes(searchText)
      ));
  }

  componentDidMount() {
    // TODO: change this after upgrading to mobx6 as that versions' reactions have this functionality
    let prevSize = extensionLoader.userExtensions.size;

    disposeOnUnmount(this, [
      reaction(() => extensionLoader.userExtensions.size, curSize => {
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
          <Button plain active disabled={isUninstalling} waiting={isUninstalling} onClick={() => {
            confirmUninstallExtension(extension);
          }}>Uninstall</Button>
        </div>
      </div>
    );
  }

  renderExtensions() {
    if (!extensionDiscovery.isLoaded) {
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
    const topHeader = <h2>Manage Lens Extensions</h2>;
    const { installPath } = this;

    return (
      <DropFileInput onDropFiles={installOnDrop}>
        <PageLayout showOnTop className="Extensions" header={topHeader} contentGaps={false}>
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
                placeholder={`Path or URL to an extension package (${supportedFormats.join(", ")})`}
                showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
                validators={installPath ? Extensions.installPathValidator : undefined}
                value={installPath}
                onChange={value => this.installPath = value}
                onSubmit={() => installFromUrlOrPath(this.installPath)}
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
              disabled={ExtensionInstallationStateStore.anyPreInstallingOrInstalling || !Extensions.installPathValidator.validate(installPath)}
              waiting={ExtensionInstallationStateStore.anyPreInstallingOrInstalling}
              onClick={() => installFromUrlOrPath(this.installPath)}
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
