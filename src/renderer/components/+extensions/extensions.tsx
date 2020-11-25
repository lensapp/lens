import "./extensions.scss";
import { remote, shell } from "electron";
import os from "os";
import path from "path";
import fse from "fs-extra";
import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Button } from "../button";
import { WizardLayout } from "../layout/wizard-layout";
import { DropFileInput, Input, InputValidators, SearchInput } from "../input";
import { Icon } from "../icon";
import { SubTitle } from "../layout/sub-title";
import { PageLayout } from "../layout/page-layout";
import logger from "../../../main/logger";
import { extensionLoader } from "../../../extensions/extension-loader";
import { extensionDiscovery, manifestFilename } from "../../../extensions/extension-discovery";
import { LensExtensionManifest, sanitizeExtensionName } from "../../../extensions/lens-extension";
import { Notifications } from "../notifications";
import { downloadFile, extractTar, listTarEntries, readFileFromTar } from "../../../common/utils";
import { docsUrl } from "../../../common/vars";

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
  private supportedFormats = [".tar", ".tgz"];
  @observable search = "";
  @observable downloadUrl = "";

  @computed get extensions() {
    const searchText = this.search.toLowerCase();
    return Array.from(extensionLoader.userExtensions.values()).filter(ext => {
      const { name, description } = ext.manifest;
      return [
        name.toLowerCase().includes(searchText),
        description.toLowerCase().includes(searchText),
      ].some(v => v);
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

  addExtensions = () => {
    const { downloadUrl } = this;
    if (downloadUrl && InputValidators.isUrl.validate(downloadUrl)) {
      this.installFromUrl(downloadUrl);
    } else {
      this.installFromSelectFileDialog();
    }
  };

  installFromUrl = async (url: string) => {
    try {
      const { promise: filePromise } = downloadFile({ url });
      this.requestInstall([{
        fileName: path.basename(url),
        data: await filePromise,
      }]);
    } catch (err) {
      Notifications.error(
        <p>Installation via URL has failed: <b>{String(err)}</b></p>
      );
    }
  };

  installOnDrop = (files: File[]) => {
    logger.info('Install from D&D');
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
        .map(req => {
          return fse.readFile(req.filePath).then(data => {
            req.data = data;
            preloadedRequests.push(req);
          }).catch(err => {
            if (showError) {
              Notifications.error(`Error while reading "${req.filePath}": ${String(err)}`);
            }
          });
        })
    );
    return preloadedRequests as InstallRequestPreloaded[];
  }

  async validatePackage(filePath: string): Promise<LensExtensionManifest> {
    const tarFiles = await listTarEntries(filePath);

    // tarball from npm contains single root folder "package/*"
    const rootFolder = tarFiles[0].split("/")[0];
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
        } catch (err) {
          fse.unlink(tempFile).catch(() => null); // remove invalid temp package
          if (showErrors) {
            Notifications.error(
              <div className="flex column gaps">
                <p>Installing <em>{req.fileName}</em> has failed, skipping.</p>
                <p>Reason: <em>{String(err)}</em></p>
              </div>
            );
          }
        }
      })
    );
    return validatedRequests;
  }

  async requestInstall(requests: InstallRequest[]) {
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
    const extName = `${name}@${version}`;
    logger.info(`Unpacking extension ${extName}`, { fileName, tempFile });
    const unpackingTempFolder = path.join(path.dirname(tempFile), path.basename(tempFile) + "-unpacked");
    const extensionFolder = this.getExtensionDestFolder(name);
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
      Notifications.ok(
        <p>Extension <b>{extName}</b> successfully installed!</p>
      );
    } catch (err) {
      Notifications.error(
        <p>Installing extension <b>{extName}</b> has failed: <em>{err}</em></p>
      );
    } finally {
      // clean up
      fse.remove(unpackingTempFolder).catch(Function);
      fse.unlink(tempFile).catch(Function);
    }
  }

  renderInfo() {
    return (
      <div className="extensions-info flex column gaps">
        <h2>Lens Extensions</h2>
        <div>
          The features that Lens includes out-of-the-box are just the start.
          Lens extensions let you add new features to your installation to support your workflow.
          Rich extensibility model lets extension authors plug directly into the Lens UI and contribute functionality through the same APIs used by Lens itself.
          Check out documentation to <a href={`${docsUrl}/latest/extensions/usage/`} target="_blank">learn more</a>.
        </div>
        <div className="install-extension flex column gaps">
          <SubTitle title="Install extension:"/>
          <Input
            showErrorsAsTooltip={true}
            className="box grow"
            theme="round-black"
            iconLeft="link"
            placeholder={`URL to an extension package (${this.supportedFormats.join(", ")})`}
            validators={InputValidators.isUrl}
            value={this.downloadUrl}
            onChange={v => this.downloadUrl = v}
            onSubmit={this.addExtensions}
          />
          <Button
            primary
            label="Install"
            onClick={this.addExtensions}
          />
          <p className="hint">
            <Trans><b>Pro-Tip</b>: you can drag & drop extension's tarball here to request installation</Trans>
          </p>
        </div>
      </div>
    );
  }

  renderExtensions() {
    const { extensions, extensionsPath, search } = this;
    if (!extensions.length) {
      return (
        <div className="flex align-center box grow justify-center gaps">
          {search && <Trans>No search results found</Trans>}
          {!search && <p><Trans>There are no extensions in</Trans> <code>{extensionsPath}</code></p>}
        </div>
      );
    }
    return extensions.map(ext => {
      const { manifestPath: extId, isEnabled, manifest } = ext;
      const { name, description } = manifest;
      return (
        <div key={extId} className="extension flex gaps align-center">
          <div className="box grow flex column gaps">
            <div className="package">
              Name: <code className="name">{name}</code>
            </div>
            <div>
              Description: <span className="text-secondary">{description}</span>
            </div>
          </div>
          {!isEnabled && (
            <Button plain active onClick={() => ext.isEnabled = true}>Enable</Button>
          )}
          {isEnabled && (
            <Button accent onClick={() => ext.isEnabled = false}>Disable</Button>
          )}
        </div>
      );
    });
  }

  render() {
    return (
      <PageLayout showOnTop className="Extensions" header={<h2>Extensions</h2>}>
        <DropFileInput onDropFiles={this.installOnDrop}>
          <WizardLayout infoPanel={this.renderInfo()}>
            <SearchInput
              placeholder={_i18n._(t`Search installed extensions`)}
              value={this.search}
              onChange={(value) => this.search = value}
            />
            <div className="extensions-list">
              {this.renderExtensions()}
            </div>
          </WizardLayout>
        </DropFileInput>
      </PageLayout>
    );
  }
}
