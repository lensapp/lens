import { t, Trans } from "@lingui/macro";
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
import { _i18n } from "../../i18n";
import { prevDefault } from "../../utils";
import { Button } from "../button";
import { ConfirmDialog } from "../confirm-dialog";
import { Icon } from "../icon";
import { DropFileInput, Input, InputValidator, InputValidators, SearchInput } from "../input";
import { PageLayout } from "../layout/page-layout";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { TooltipPosition } from "../tooltip";
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

interface ExtensionState {
  displayName: string;
  // Possible states the extension can be
  state: "installing" | "uninstalling";
}

@observer
export class Extensions extends React.Component {
  private supportedFormats = ["tar", "tgz"];

  private installPathValidator: InputValidator = {
    message: <Trans>Invalid URL or absolute path</Trans>,
    validate(value: string) {
      return InputValidators.isUrl.validate(value) || InputValidators.isPath.validate(value);
    }
  };

  @observable
  extensionState = observable.map<string, ExtensionState>();

  @observable search = "";
  @observable installPath = "";

  /**
   * Extensions that were removed from extensions but are still in "uninstalling" state
   */
  @computed get removedUninstalling() {
    return Array.from(this.extensionState.entries()).filter(([id, extension]) =>
      extension.state === "uninstalling" && !this.extensions.find(extension => extension.id === id)
    ).map(([id, extension]) => ({ ...extension, id }));
  }

  /**
   * Extensions that were added to extensions but are still in "installing" state
   */
  @computed get addedInstalling() {
    return Array.from(this.extensionState.entries()).filter(([id, extension]) =>
      extension.state === "installing" && this.extensions.find(extension => extension.id === id)
    ).map(([id, extension]) => ({ ...extension, id }));
  }

  componentDidMount() {
    disposeOnUnmount(this,
      reaction(() => this.extensions, () => {
        this.removedUninstalling.forEach(({ id, displayName }) => {
          Notifications.ok(
            <p>Extension <b>{displayName}</b> successfully uninstalled!</p>
          );
          this.extensionState.delete(id);
        });

        this.addedInstalling.forEach(({ id, displayName }) => {
          const extension = this.extensions.find(extension => extension.id === id);

          if (!extension) {
            throw new Error("Extension not found");
          }

          Notifications.ok(
            <p>Extension <b>{displayName}</b> successfully installed!</p>
          );
          this.extensionState.delete(id);
          this.installPath = "";

          // Enable installed extensions by default.
          extension.isEnabled = true;
        });
      })
    );
  }

  @computed get extensions() {
    const searchText = this.search.toLowerCase();

    return Array.from(extensionLoader.userExtensions.values()).filter(ext => {
      const { name, description } = ext.manifest;

      return [
        name.toLowerCase().includes(searchText),
        description?.toLowerCase().includes(searchText),
      ].some(value => value);
    });
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
      message: _i18n._(t`Select extensions to install (formats: ${this.supportedFormats.join(", ")}), `),
      buttonLabel: _i18n._(t`Use configuration`),
      filters: [
        { name: "tarball", extensions: this.supportedFormats }
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
    const fileName = path.basename(installPath);

    try {
      // install via url
      // fixme: improve error messages for non-tar-file URLs
      if (InputValidators.isUrl.validate(installPath)) {
        const { promise: filePromise } = downloadFile({ url: installPath, timeout: 60000 /*1m*/ });
        const data = await filePromise;

        this.requestInstall({ fileName, data });
      }
      // otherwise installing from system path
      else if (InputValidators.isPath.validate(installPath)) {
        this.requestInstall({ fileName, filePath: installPath });
      }
    } catch (error) {
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
    const preloadedRequests = requests.filter(req => req.data);

    await Promise.all(
      requests
        .filter(req => !req.data && req.filePath)
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

    requests.forEach(req => {
      const tempFile = this.getExtensionPackageTemp(req.fileName);

      fse.writeFileSync(tempFile, req.data);
    });

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

    validatedRequests.forEach(install => {
      const { name, version, description } = install.manifest;
      const extensionFolder = this.getExtensionDestFolder(name);
      const folderExists = fse.existsSync(extensionFolder);

      if (!folderExists) {
        // auto-install extension if not yet exists
        this.unpackExtension(install);
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
            <Button autoFocus label="Install" onClick={() => {
              removeNotification();
              this.unpackExtension(install);
            }}/>
          </div>
        );
      }
    });
  }

  async unpackExtension({ fileName, tempFile, manifest: { name, version } }: InstallRequestValidated) {
    const displayName = extensionDisplayName(name, version);
    const extensionFolder = this.getExtensionDestFolder(name);
    const unpackingTempFolder = path.join(path.dirname(tempFile), `${path.basename(tempFile)}-unpacked`);
    const extensionId = path.join(extensionDiscovery.nodeModulesPath, name, "package.json");

    logger.info(`Unpacking extension ${displayName}`, { fileName, tempFile });

    this.extensionState.set(extensionId, {
      state: "installing",
      displayName
    });

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
      if (this.extensionState.get(extensionId)?.state === "installing") {
        this.extensionState.delete(extensionId);
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
      labelOk: <Trans>Yes</Trans>,
      labelCancel: <Trans>No</Trans>,
      ok: () => this.uninstallExtension(extension)
    });
  };

  async uninstallExtension(extension: InstalledExtension) {
    const displayName = extensionDisplayName(extension.manifest.name, extension.manifest.version);

    try {
      this.extensionState.set(extension.id, {
        state: "uninstalling",
        displayName
      });

      await extensionDiscovery.uninstallExtension(extension.absolutePath);
    } catch (error) {
      Notifications.error(
        <p>Uninstalling extension <b>{displayName}</b> has failed: <em>{error?.message ?? ""}</em></p>
      );

      // Remove uninstall state on uninstall failure
      if (this.extensionState.get(extension.id)?.state === "uninstalling") {
        this.extensionState.delete(extension.id);
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
      const { name, description } = manifest;
      const isUninstalling = this.extensionState.get(id)?.state === "uninstalling";

      return (
        <div key={id} className="extension flex gaps align-center">
          <div className="box grow">
            <div className="name">
              Name: <code className="name">{name}</code>
            </div>
            <div className="description">
              Description: <span className="text-secondary">{description}</span>
            </div>
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
    return [...this.extensionState.values()].some(extension => extension.state === "installing");
  }

  render() {
    const topHeader = <h2>Manage Lens Extensions</h2>;
    const { installPath } = this;

    return (
      <DropFileInput onDropFiles={this.installOnDrop}>
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
                placeholder={`Path or URL to an extension package (${this.supportedFormats.join(", ")})`}
                showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
                validators={installPath ? this.installPathValidator : undefined}
                value={installPath}
                onChange={value => this.installPath = value}
                onSubmit={this.installFromUrlOrPath}
                iconLeft="link"
                iconRight={
                  <Icon
                    interactive
                    material="folder"
                    onMouseDown={prevDefault(this.installFromSelectFileDialog)}
                    tooltip={<Trans>Browse</Trans>}
                  />
                }
              />
            </div>
            <Button
              primary
              label="Install"
              disabled={this.isInstalling || !this.installPathValidator.validate(installPath)}
              waiting={this.isInstalling}
              onClick={this.installFromUrlOrPath}
            />
            <small className="hint">
              <Trans><b>Pro-Tip</b>: you can drag & drop extension&apos;s tarball-file to install</Trans>
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
