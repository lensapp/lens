import { t, Trans } from "@lingui/macro";
import { remote, shell } from "electron";
import fse from "fs-extra";
import { computed, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import os from "os";
import path from "path";
import React from "react";
import { autobind, downloadFile, extractTar, listTarEntries, readFileFromTar } from "../../../common/utils";
import { docsUrl } from "../../../common/vars";
import { extensionDiscovery, InstalledExtension, manifestFilename } from "../../../extensions/extension-discovery";
import { extensionLoader } from "../../../extensions/extension-loader";
import { extensionDisplayName, LensExtensionManifest, sanitizeExtensionName } from "../../../extensions/lens-extension";
import logger from "../../../main/logger";
import { _i18n } from "../../i18n";
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
import { ExtensionStateStore } from "./extension-install.store";
import "./extensions.scss";

interface InstallRequest {
  fileName: string;
  filePath?: string;
  data?: Buffer;
}

interface InstallRequestPreloaded extends InstallRequest {
  data: Buffer;
}

interface InstallRequestValidated extends InstallRequestPreloaded {
  manifest: LensExtensionManifest;
  tempFile: string; // temp system path to packed extension for unpacking
}

function searchForExtensions(searchText = "") {
  return Array.from(extensionLoader.userExtensions.values())
    .filter(({ manifest: { name, description } }) => (
      name.toLowerCase().includes(searchText)
      || description?.toLowerCase().includes(searchText)
    ));
}

async function validatePackage(filePath: string): Promise < LensExtensionManifest > {
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

async function preloadExtensions(requests: InstallRequest[], { showError = true } = {}) {
  const preloadedRequests = requests.filter(request => request.data);

  await Promise.all(
    requests
      .filter(request => !request.data && request.filePath)
      .map(async request => {
        try {
          const data = await fse.readFile(request.filePath);

          request.data = data;
          preloadedRequests.push(request);

          return request;
        } catch (error) {
          if (showError) {
            Notifications.error(`Error while reading "${request.filePath}": ${String(error)}`);
          }
        }
      })
  );

  return preloadedRequests as InstallRequestPreloaded[];
}

async function createTempFilesAndValidate(requests: InstallRequestPreloaded[], { showErrors = true } = {}) {
  const validatedRequests: InstallRequestValidated[] = [];

  // copy files to temp
  await fse.ensureDir(getExtensionPackageTemp());

  for (const request of requests) {
    const tempFile = getExtensionPackageTemp(request.fileName);

    await fse.writeFile(tempFile, request.data);
  }

  // validate packages
  await Promise.all(
    requests.map(async req => {
      const tempFile = getExtensionPackageTemp(req.fileName);

      try {
        const manifest = await validatePackage(tempFile);

        validatedRequests.push({
          ...req,
          manifest,
          tempFile,
        });
      } catch (error) {
        fse.unlink(tempFile).catch(() => null); // remove invalid temp package

        if (showErrors) {
          Notifications.error(
            <div className="flex column gaps">
              <p>Installing <em>{req.fileName}</em> has failed, skipping.</p>
              <p>Reason: <em>{String(error)}</em></p>
            </div>
          );
        }
      }
    })
  );

  return validatedRequests;
}

async function requestInstall(init: InstallRequest | InstallRequest[]) {
  const requests = Array.isArray(init) ? init : [init];
  const preloadedRequests = await preloadExtensions(requests);
  const validatedRequests = await createTempFilesAndValidate(preloadedRequests);

  // If there are no requests for installing, reset startingInstall state
  if (validatedRequests.length === 0) {
    ExtensionStateStore.getInstance<ExtensionStateStore>().startingInstall = false;
  }

  for (const install of validatedRequests) {
    const { name, version, description } = install.manifest;
    const extensionFolder = getExtensionDestFolder(name);
    const folderExists = await fse.pathExists(extensionFolder);

    if (!folderExists) {
      // auto-install extension if not yet exists
      unpackExtension(install);
    } else {
      // If we show the confirmation dialog, we stop the install spinner until user clicks ok
      // and the install continues
      ExtensionStateStore.getInstance<ExtensionStateStore>().startingInstall = false;

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
          <Button autoFocus label="Install" onClick={() => {
            removeNotification();
            unpackExtension(install);
          }} />
        </div>
      );
    }
  }
}

async function unpackExtension({ fileName, tempFile, manifest: { name, version } }: InstallRequestValidated) {
  const displayName = extensionDisplayName(name, version);
  const extensionId = path.join(extensionDiscovery.nodeModulesPath, name, "package.json");

  logger.info(`Unpacking extension ${displayName}`, { fileName, tempFile });

  ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.set(extensionId, {
    state: "installing",
    displayName
  });
  ExtensionStateStore.getInstance<ExtensionStateStore>().startingInstall = false;

  const extensionFolder = getExtensionDestFolder(name);
  const unpackingTempFolder = path.join(path.dirname(tempFile), `${path.basename(tempFile)}-unpacked`);

  logger.info(`Unpacking extension ${displayName}`, { fileName, tempFile });

  try {
    // extract to temp folder first
    await fse.remove(unpackingTempFolder).catch(Function);
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
  } catch (error) {
    Notifications.error(
      <p>Installing extension <b>{displayName}</b> has failed: <em>{error}</em></p>
    );

    // Remove install state on install failure
    if (ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.get(extensionId)?.state === "installing") {
      ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.delete(extensionId);
    }
  } finally {
    // clean up
    fse.remove(unpackingTempFolder).catch(Function);
    fse.unlink(tempFile).catch(Function);
  }
}

/**
 * Extensions that were removed from extensions but are still in "uninstalling" state
 */
function removedUninstalling(searchText = "") {
  const extensions = searchForExtensions(searchText);

  return Array.from(ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.entries())
    .filter(([id, extension]) =>
      extension.state === "uninstalling"
      && !extensions.find(extension => extension.id === id)
    )
    .map(([id, extension]) => ({ ...extension, id }));
}


/**
 * Extensions that were added to extensions but are still in "installing" state
 */
function addedInstalling(searchText = "") {
  const extensions = searchForExtensions(searchText);

  return Array.from(ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.entries())
    .filter(([id, extension]) =>
      extension.state === "installing"
      && extensions.find(extension => extension.id === id)
    )
    .map(([id, extension]) => ({ ...extension, id }));
}

function getExtensionPackageTemp(fileName = "") {
  return path.join(os.tmpdir(), "lens-extensions", fileName);
}

function getExtensionDestFolder(name: string) {
  return path.join(extensionDiscovery.localFolderPath, sanitizeExtensionName(name));
}

async function uninstallExtension(extension: InstalledExtension) {
  const displayName = extensionDisplayName(extension.manifest.name, extension.manifest.version);

  try {
    ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.set(extension.id, {
      state: "uninstalling",
      displayName
    });

    await extensionDiscovery.uninstallExtension(extension.absolutePath);
  } catch (error) {
    Notifications.error(
      <p>Uninstalling extension <b>{displayName}</b> has failed: <em>{error?.message ?? ""}</em></p>
    );

    // Remove uninstall state on uninstall failure
    if (ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.get(extension.id)?.state === "uninstalling") {
      ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.delete(extension.id);
    }
  }
}

function confirmUninstallExtension(extension: InstalledExtension) {
  const displayName = extensionDisplayName(extension.manifest.name, extension.manifest.version);

  ConfirmDialog.open({
    message: <p>Are you sure you want to uninstall extension <b>{displayName}</b>?</p>,
    labelOk: <Trans>Yes</Trans>,
    labelCancel: <Trans>No</Trans>,
    ok: () => uninstallExtension(extension)
  });
}

function installOnDrop(files: File[]) {
  logger.info("Install from D&D");

  return requestInstall(
    files.map(file => ({
      fileName: path.basename(file.path),
      filePath: file.path,
    }))
  );
}

async function installFromSelectFileDialog() {
  const { dialog, BrowserWindow, app } = remote;
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    defaultPath: app.getPath("downloads"),
    properties: ["openFile", "multiSelections"],
    message: _i18n._(t`Select extensions to install (formats: ${SupportedFormats.join(", ")}), `),
    buttonLabel: _i18n._(t`Use configuration`),
    filters: [
      { name: "tarball", extensions: [...SupportedFormats] }
    ]
  });

  if (!canceled && filePaths.length) {
    requestInstall(
      filePaths.map(filePath => ({
        fileName: path.basename(filePath),
        filePath,
      }))
    );
  }
}

/**
 * Start extension install using a package name, which is resolved to a tarball url using the npm registry.
 * @param packageName e.g. "@publisher/extension-name"
 */
export async function installFromNpm(packageName: string) {
  const tarballUrl = await extensionLoader.getNpmPackageTarballUrl(packageName);

  return installFromUrlOrPath(tarballUrl);
}

async function installFromUrlOrPath(installPath: string) {
  ExtensionStateStore.getInstance<ExtensionStateStore>().startingInstall = true;
  const fileName = path.basename(installPath);

  try {
    // install via url
    // fixme: improve error messages for non-tar-file URLs
    if (InputValidators.isUrl.validate(installPath)) {
      const { promise: filePromise } = downloadFile({ url: installPath, timeout: 60000 /*1m*/ });
      const data = await filePromise;

      await requestInstall({ fileName, data });
    }
    // otherwise installing from system path
    else if (InputValidators.isPath.validate(installPath)) {
      await requestInstall({ fileName, filePath: installPath });
    }
  } catch (error) {
    ExtensionStateStore.getInstance<ExtensionStateStore>().startingInstall = false;
    Notifications.error(
      <p>Installation has failed: <b>{String(error)}</b></p>
    );
  }
}

const SupportedFormats = Object.freeze(["tar", "tgz"]);

@observer
export class Extensions extends React.Component {
  private static installPathValidator: InputValidator = {
    message: <Trans>Invalid URL or absolute path</Trans>,
    validate(value: string) {
      return InputValidators.isUrl.validate(value) || InputValidators.isPath.validate(value);
    }
  };

  @observable search = "";
  @observable installPath = "";

  // True if the preliminary install steps have started, but unpackExtension has not started yet
  @observable startingInstall = false;

  /**
   * Start extension install using the current value of this.installPath
   */
  @autobind()
  async installFromInstallPath() {
    if (this.installPath) {
      installFromUrlOrPath(this.installPath);
    }
  }

  componentDidMount() {
    disposeOnUnmount(this,
      reaction(() => this.extensions, () => {
        removedUninstalling(this.search.toLowerCase()).forEach(({ id, displayName }) => {
          Notifications.ok(
            <p>Extension <b>{displayName}</b> successfully uninstalled!</p>
          );
          ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.delete(id);
        });

        addedInstalling(this.search.toLowerCase()).forEach(({ id, displayName }) => {
          const extension = this.extensions.find(extension => extension.id === id);

          if (!extension) {
            throw new Error("Extension not found");
          }

          Notifications.ok(
            <p>Extension <b>{displayName}</b> successfully installed!</p>
          );
          ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.delete(id);
          this.installPath = "";

          // Enable installed extensions by default.
          extension.isEnabled = true;
        });
      })
    );
  }

  @computed get extensions() {
    return searchForExtensions(this.search.toLowerCase());
  }

  renderExtensions() {
    const { extensions, search } = this;

    if (!extensions.length) {
      return (
        <div className="no-extensions flex box gaps justify-center">
          <Icon material="info"/>
          <div>
            {
              search
                ? <p>No search results found</p>
                : <p>There are no installed extensions. See list of <a href="https://github.com/lensapp/lens-extensions/blob/main/README.md" target="_blank" rel="noreferrer">available extensions</a>.</p>
            }
          </div>
        </div>
      );
    }

    return extensions.map(extension => {
      const { id, isEnabled, manifest } = extension;
      const { name, description } = manifest;
      const isUninstalling = ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.get(id)?.state === "uninstalling";

      return (
        <div key={id} className="extension flex gaps align-center">
          <div className="box grow">
            <div className="name">
              {name}
            </div>
            <div className="description">
              {description}
            </div>
          </div>
          <div className="actions">
            <Button
              plain={isEnabled}
              accent={!isEnabled}
              active
              disabled={isUninstalling}
              onClick={() => extension.isEnabled = !extension.isEnabled}
            >
              {isEnabled ? "Disable" : "Enable"}
            </Button>
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
    });
  }

  /**
   * True if at least one extension is in installing state
   */
  @computed get isInstalling() {
    return [...ExtensionStateStore.getInstance<ExtensionStateStore>().extensionState.values()].some(extension => extension.state === "installing");
  }

  render() {
    const topHeader = <h2>Manage Lens Extensions</h2>;
    const { installPath } = this;

    return (
      <DropFileInput onDropFiles={installOnDrop}>
        <PageLayout showOnTop className="Extensions flex column gaps" header={topHeader} contentGaps={false}>
          <h2>Lens Extensions</h2>
          <div>
            Add new features and functionality via Lens Extensions.
            Check out documentation to <a href={`${docsUrl}/latest/extensions/usage/`} target="_blank" rel="noreferrer">learn more</a> or see the list of <a href="https://github.com/lensapp/lens-extensions/blob/main/README.md" target="_blank" rel="noreferrer">available extensions</a>.
          </div>

          <div className="install-extension flex column gaps">
            <SubTitle title={<Trans>Install Extension:</Trans>}/>
            <div className="extension-input flex box gaps align-center">
              <Input
                className="box grow"
                theme="round-black"
                disabled={this.isInstalling}
                placeholder={`Path or URL to an extension package (${SupportedFormats.join(", ")})`}
                showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
                validators={installPath ? Extensions.installPathValidator : undefined}
                value={installPath}
                onChange={value => this.installPath = value}
                onSubmit={this.installFromInstallPath}
                iconLeft="link"
                iconRight={
                  <Icon
                    interactive
                    material="folder"
                    onClick={prevDefault(installFromSelectFileDialog)}
                    tooltip={<Trans>Browse</Trans>}
                  />
                }
              />
            </div>
            <Button
              primary
              label="Install"
              disabled={this.isInstalling || !Extensions.installPathValidator.validate(installPath)}
              waiting={this.isInstalling}
              onClick={this.installFromInstallPath}
            />
            <small className="hint">
              <Trans><b>Pro-Tip</b>: you can also drag-n-drop tarball-file to this area</Trans>
            </small>
          </div>

          <h2>Installed Extensions</h2>
          <div className="installed-extensions flex column gaps">
            <SearchInput
              placeholder="Search installed extensions by name or description"
              value={this.search}
              onChange={(value) => this.search = value}
            />
            {extensionDiscovery.isLoaded ? this.renderExtensions() : <div className="spinner-wrapper"><Spinner/></div>}
          </div>
        </PageLayout>
      </DropFileInput>
    );
  }
}
