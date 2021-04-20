import { remote, shell } from "electron";
import fse from "fs-extra";
import { computed, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import os from "os";
import path from "path";
import React from "react";
import { downloadFile, extractTar, listTarEntries, readFileFromTar } from "../../../common/utils";
import { docsUrl } from "../../../common/vars";
import { extensionDiscovery, InstalledExtension, manifestFilename } from "../../../extensions/extension-discovery";
import { extensionLoader } from "../../../extensions/extension-loader";
import { extensionDisplayName, LensExtensionManifest, sanitizeExtensionName } from "../../../extensions/lens-extension";
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

@observer
export class Extensions extends React.Component {
  private static supportedFormats = ["tar", "tgz"];

  private static installPathValidator: InputValidator = {
    message: "Invalid URL or absolute path",
    validate(value: string) {
      return InputValidators.isUrl.validate(value) || InputValidators.isPath.validate(value);
    }
  };

  get extensionStateStore() {
    return ExtensionStateStore.getInstance<ExtensionStateStore>();
  }

  @observable search = "";
  @observable installPath = "";

  // True if the preliminary install steps have started, but unpackExtension has not started yet
  @observable startingInstall = false;

  /**
   * Extensions that were removed from extensions but are still in "uninstalling" state
   */
  @computed get removedUninstalling() {
    return Array.from(this.extensionStateStore.extensionState.entries())
      .filter(([id, extension]) =>
        extension.state === "uninstalling"
        && !this.extensions.find(extension => extension.id === id)
      )
      .map(([id, extension]) => ({ ...extension, id }));
  }

  /**
   * Extensions that were added to extensions but are still in "installing" state
   */
  @computed get addedInstalling() {
    return Array.from(this.extensionStateStore.extensionState.entries())
      .filter(([id, extension]) =>
        extension.state === "installing"
        && this.extensions.find(extension => extension.id === id)
      )
      .map(([id, extension]) => ({ ...extension, id }));
  }

  componentDidMount() {
    disposeOnUnmount(this,
      reaction(() => this.extensions, () => {
        this.removedUninstalling.forEach(({ id, displayName }) => {
          Notifications.ok(
            <p>Extension <b>{displayName}</b> successfully uninstalled!</p>
          );
          this.extensionStateStore.extensionState.delete(id);
        });

        this.addedInstalling.forEach(({ id, displayName }) => {
          const extension = this.extensions.find(extension => extension.id === id);

          if (!extension) {
            throw new Error("Extension not found");
          }

          Notifications.ok(
            <p>Extension <b>{displayName}</b> successfully installed!</p>
          );
          this.extensionStateStore.extensionState.delete(id);
          this.installPath = "";

          // Enable installed extensions by default.
          extension.isEnabled = true;
        });
      })
    );
  }

  @computed get extensions() {
    const searchText = this.search.toLowerCase();

    return Array.from(extensionLoader.userExtensions.values())
      .filter(({ manifest: { name, description }}) => (
        name.toLowerCase().includes(searchText)
        || description?.toLowerCase().includes(searchText)
      ));
  }

  get extensionsPath() {
    return extensionDiscovery.localFolderPath;
  }

  getExtensionPackageTemp(fileName = "") {
    return path.join(os.tmpdir(), "lens-extensions", fileName);
  }

  getExtensionDestFolder(name: string) {
    return path.join(this.extensionsPath, sanitizeExtensionName(name));
  }

  installFromSelectFileDialog = async () => {
    const { dialog, BrowserWindow, app } = remote;
    const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      defaultPath: app.getPath("downloads"),
      properties: ["openFile", "multiSelections"],
      message: `Select extensions to install (formats: ${Extensions.supportedFormats.join(", ")}), `,
      buttonLabel: `Use configuration`,
      filters: [
        { name: "tarball", extensions: Extensions.supportedFormats }
      ]
    });

    if (!canceled && filePaths.length) {
      this.requestInstall(
        filePaths.map(filePath => ({
          fileName: path.basename(filePath),
          filePath,
        }))
      );
    }
  };

  installFromUrlOrPath = async () => {
    const { installPath } = this;

    if (!installPath) return;

    this.startingInstall = true;
    const fileName = path.basename(installPath);

    try {
      // install via url
      // fixme: improve error messages for non-tar-file URLs
      if (InputValidators.isUrl.validate(installPath)) {
        const { promise: filePromise } = downloadFile({ url: installPath, timeout: 60000 /*1m*/ });
        const data = await filePromise;

        await this.requestInstall({ fileName, data });
      }
      // otherwise installing from system path
      else if (InputValidators.isPath.validate(installPath)) {
        await this.requestInstall({ fileName, filePath: installPath });
      }
    } catch (error) {
      this.startingInstall = false;
      Notifications.error(
        <p>Installation has failed: <b>{String(error)}</b></p>
      );
    }
  };

  installOnDrop = (files: File[]) => {
    logger.info("Install from D&D");

    return this.requestInstall(
      files.map(file => ({
        fileName: path.basename(file.path),
        filePath: file.path,
      }))
    );
  };

  async preloadExtensions(requests: InstallRequest[], { showError = true } = {}) {
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
          } catch(error) {
            if (showError) {
              Notifications.error(`Error while reading "${request.filePath}": ${String(error)}`);
            }
          }
        })
    );

    return preloadedRequests as InstallRequestPreloaded[];
  }

  async validatePackage(filePath: string): Promise<LensExtensionManifest> {
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

    if (!manifest.lens && !manifest.renderer) {
      throw new Error(`${manifestFilename} must specify "main" and/or "renderer" fields`);
    }

    return manifest;
  }

  async createTempFilesAndValidate(requests: InstallRequestPreloaded[], { showErrors = true } = {}) {
    const validatedRequests: InstallRequestValidated[] = [];

    // copy files to temp
    await fse.ensureDir(this.getExtensionPackageTemp());

    for (const request of requests) {
      const tempFile = this.getExtensionPackageTemp(request.fileName);

      await fse.writeFile(tempFile, request.data);
    }

    // validate packages
    await Promise.all(
      requests.map(async req => {
        const tempFile = this.getExtensionPackageTemp(req.fileName);

        try {
          const manifest = await this.validatePackage(tempFile);

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

  async requestInstall(init: InstallRequest | InstallRequest[]) {
    const requests = Array.isArray(init) ? init : [init];
    const preloadedRequests = await this.preloadExtensions(requests);
    const validatedRequests = await this.createTempFilesAndValidate(preloadedRequests);

    // If there are no requests for installing, reset startingInstall state
    if (validatedRequests.length === 0) {
      this.startingInstall = false;
    }

    for (const install of validatedRequests) {
      const { name, version, description } = install.manifest;
      const extensionFolder = this.getExtensionDestFolder(name);
      const folderExists = await fse.pathExists(extensionFolder);

      if (!folderExists) {
        // auto-install extension if not yet exists
        this.unpackExtension(install);
      } else {
        // If we show the confirmation dialog, we stop the install spinner until user clicks ok
        // and the install continues
        this.startingInstall = false;

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
              this.unpackExtension(install);
            }}/>
          </div>
        );
      }
    }
  }

  async unpackExtension({ fileName, tempFile, manifest: { name, version } }: InstallRequestValidated) {
    const displayName = extensionDisplayName(name, version);
    const extensionId = path.join(extensionDiscovery.nodeModulesPath, name, "package.json");

    logger.info(`Unpacking extension ${displayName}`, { fileName, tempFile });

    this.extensionStateStore.extensionState.set(extensionId, {
      state: "installing",
      displayName
    });
    this.startingInstall = false;

    const extensionFolder = this.getExtensionDestFolder(name);
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
      if (this.extensionStateStore.extensionState.get(extensionId)?.state === "installing") {
        this.extensionStateStore.extensionState.delete(extensionId);
      }
    } finally {
      // clean up
      fse.remove(unpackingTempFolder).catch(Function);
      fse.unlink(tempFile).catch(Function);
    }
  }

  confirmUninstallExtension = (extension: InstalledExtension) => {
    const displayName = extensionDisplayName(extension.manifest.name, extension.manifest.version);

    ConfirmDialog.open({
      message: <p>Are you sure you want to uninstall extension <b>{displayName}</b>?</p>,
      labelOk: "Yes",
      labelCancel: "No",
      ok: () => this.uninstallExtension(extension)
    });
  };

  async uninstallExtension(extension: InstalledExtension) {
    const displayName = extensionDisplayName(extension.manifest.name, extension.manifest.version);

    try {
      this.extensionStateStore.extensionState.set(extension.id, {
        state: "uninstalling",
        displayName
      });

      await extensionDiscovery.uninstallExtension(extension);
    } catch (error) {
      Notifications.error(
        <p>Uninstalling extension <b>{displayName}</b> has failed: <em>{error?.message ?? ""}</em></p>
      );

      // Remove uninstall state on uninstall failure
      if (this.extensionStateStore.extensionState.get(extension.id)?.state === "uninstalling") {
        this.extensionStateStore.extensionState.delete(extension.id);
      }
    }
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
      const { name, description, version } = manifest;
      const isUninstalling = this.extensionStateStore.extensionState.get(id)?.state === "uninstalling";

      return (
        <div key={id} className="extension flex gaps align-center">
          <div className="box grow">
            <h5>{name}</h5>
            <h6>{version}</h6>
            <p>{description}</p>
          </div>
          <div className="actions">
            {!isEnabled && (
              <Button plain active disabled={isUninstalling} onClick={() => {
                extension.isEnabled = true;
              }}>Enable</Button>
            )}
            {isEnabled && (
              <Button accent disabled={isUninstalling} onClick={() => {
                extension.isEnabled = false;
              }}>Disable</Button>
            )}
            <Button plain active disabled={isUninstalling} waiting={isUninstalling} onClick={() => {
              this.confirmUninstallExtension(extension);
            }}>Uninstall</Button>
          </div>
        </div>
      );
    });
  }

  /**
   * True if at least one extension is in installing state
   */
  @computed get isInstalling() {
    return [...this.extensionStateStore.extensionState.values()].some(extension => extension.state === "installing");
  }

  render() {
    const { installPath } = this;

    return (
      <DropFileInput onDropFiles={this.installOnDrop}>
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
                disabled={this.isInstalling}
                placeholder={`Path or URL to an extension package (${Extensions.supportedFormats.join(", ")})`}
                showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
                validators={installPath ? Extensions.installPathValidator : undefined}
                value={installPath}
                onChange={value => this.installPath = value}
                onSubmit={this.installFromUrlOrPath}
                iconLeft="link"
                iconRight={
                  <Icon
                    interactive
                    material="folder"
                    onClick={prevDefault(this.installFromSelectFileDialog)}
                    tooltip="Browse"
                  />
                }
              />
            </div>
            <Button
              primary
              label="Install"
              disabled={this.isInstalling || !Extensions.installPathValidator.validate(installPath)}
              waiting={this.isInstalling}
              onClick={this.installFromUrlOrPath}
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
            {extensionDiscovery.isLoaded ? this.renderExtensions() : <div className="spinner-wrapper"><Spinner/></div>}
          </div>
        </PageLayout>
      </DropFileInput>
    );
  }
}
