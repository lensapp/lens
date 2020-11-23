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
import { PageLayout } from "../layout/page-layout";
import { Clipboard } from "../clipboard";
import logger from "../../../main/logger";
import { extensionLoader } from "../../../extensions/extension-loader";
import { extensionManager } from "../../../extensions/extension-manager";
import { LensExtensionManifest, sanitizeExtensionName } from "../../../extensions/lens-extension";
import { Notifications } from "../notifications";
import { downloadFile } from "../../../common/utils";
import { extractTar, readFileFromTar } from "../../../common/utils/tar";

interface InstallRequest {
  fileName: string;
  filePath?: string;
  data?: Buffer;
}

interface InstallRequestValidated extends InstallRequest {
  manifest: LensExtensionManifest;
  tmpFile: string; // temp file for unpacking
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
    return extensionManager.localFolderPath;
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
          filePath: filePath,
        }))
      );
    }
  }

  installExtensions = () => {
    if (this.downloadUrl) {
      this.installFromNpmOrUrl(this.downloadUrl);
      this.downloadUrl = "";
    } else {
      this.installFromSelectFileDialog();
    }
  }

  installFromNpmOrUrl = async (url = this.downloadUrl) => {
    if (!InputValidators.isUrl.validate(url)) {
      url = extensionManager.getNpmPackageTarballUrl(url);
      if (!url) {
        Notifications.error(`Error: npm package "${url}" not found!`);
        return;
      }
    }
    try {
      const { promise: filePromise } = downloadFile({ url });
      this.requestInstall([{
        fileName: path.basename(url),
        data: await filePromise,
      }]);
    } catch (err) {
      Notifications.error(
        <div className="flex column gaps">
          <p>Installation from URL has failed: <b>{String(err)}</b></p>
          <p>URL: <em>{url}</em></p>
        </div>
      );
    }
  }

  installOnDrop = (files: File[]) => {
    logger.info('Install from D&D');
    return this.requestInstall(
      files.map(file => ({
        fileName: path.basename(file.path),
        filePath: file.path,
      }))
    );
  }

  async requestInstall(installRequests: InstallRequest[]) {
    const pendingFiles: Promise<any>[] = [];

    // read extensions with provided system path if any
    installRequests.forEach(ext => {
      if (ext.data) return;
      const promise = fse.readFile(ext.filePath)
        .then(data => ext.data = data)
        .catch(err => {
          Notifications.error(`Error while reading "${ext.filePath}": ${String(err)}`);
        });
      pendingFiles.push(promise)
    });
    await Promise.all(pendingFiles);
    installRequests = installRequests.filter(item => item.data); // remove items with reading errors

    // prepare temp folder
    const tempFolder = path.join(os.tmpdir(), "lens-extensions");
    await fse.ensureDir(tempFolder);

    // copy files to temp, get extension info from package.json and do basic validation
    let validatedInstalls: Promise<InstallRequestValidated>[] = installRequests.map(async installReq => {
      const { fileName, data } = installReq;
      const tempFile = path.join(tempFolder, fileName);
      await fse.writeFileSync(tempFile, data); // copy to temp
      try {
        const packageJson: Buffer = await readFileFromTar(tempFile, {
          // tarball from npm contains single root folder "package/*"
          fileMatcher: (path: string) => !!path.match(/(\w+\/)?package\.json$/),
          notFoundMessage: "Extension's manifest file (package.json) not found",
        });
        const manifest: LensExtensionManifest = JSON.parse(packageJson.toString("utf8"));
        if (!manifest.lens && !manifest.renderer) {
          throw `package.json must specify "main" and/or "renderer" fields`;
        }
        return {
          ...installReq,
          manifest: manifest,
          tmpFile: tempFile,
        }
      } catch (err) {
        fse.unlink(tempFile).catch(() => null); // remove invalid temp file
        Notifications.error(
          <div className="flex column gaps">
            <p>Installing <em>{fileName}</em> has failed, skipping.</p>
            <p>Reason: <em>{String(err)}</em></p>
          </div>
        );
      }
    });

    // final step, provide UI with extension info for reviewing and confirming installation
    const extensions = await Promise.all(validatedInstalls);
    extensions.forEach(install => {
      if (!install) {
        return; // skip validating errors if any
      }
      const { fileName, manifest } = install;
      const { name, version, description } = manifest;
      const extensionFolder = this.getExtensionDestFolder(name);
      const folderExists = fse.existsSync(extensionFolder);
      const removeNotification = Notifications.info(
        <div className="InstallingExtensionNotification flex gaps align-center">
          <div className="flex column gaps">
            <p>Install extension <b title={fileName}>{name}@{version}</b>?</p>
            <p>Description: <em>{description}</em></p>
            {folderExists && (
              <div className="folder-remove-warning flex gaps inline align-center" onClick={() => shell.openPath(extensionFolder)}>
                <Icon small material="warning"/>
                <p>
                  <b>Warning:</b> <code>{extensionFolder}</code> will be removed before installation.
                </p>
              </div>
            )}
          </div>
          <Button autoFocus label="Install" onClick={() => {
            removeNotification();
            this.unpackExtension(install);
          }}/>
        </div>
      );
    })
  }

  async unpackExtension({ fileName, tmpFile, manifest: { name, version } }: InstallRequestValidated) {
    logger.info(`Unpacking extension ${name} from ${fileName}`);
    const unpackingTempFolder = path.join(path.dirname(tmpFile), path.basename(tmpFile) + "-unpacked");
    const extensionFolder = this.getExtensionDestFolder(name);
    try {
      // extract to temp folder first
      await fse.remove(unpackingTempFolder).catch(Function);
      await fse.ensureDir(unpackingTempFolder);
      await extractTar(tmpFile, { cwd: unpackingTempFolder });

      // move contents to extensions folder
      const unpackedFiles = await fse.readdir(unpackingTempFolder);
      let unpackedRootFolder = unpackingTempFolder;
      if (unpackedFiles.length === 1) {
        // handle case when extension.tgz packed with top root folder,
        // e.g. "npm pack %ext_name" downloads file with "package" root folder within tarball
        unpackedRootFolder = path.join(unpackingTempFolder, unpackedFiles[0]);
      }
      await fse.ensureDir(extensionFolder);
      await fse.move(unpackedRootFolder, extensionFolder, { overwrite: true });
      Notifications.ok(
        <p>Extension <b>{name}/{version}</b> successfully installed!</p>
      );
    } catch (err) {
      Notifications.error(
        <p>Installing extension <b>{name}</b> has failed: <em>{err}</em></p>
      );
    } finally {
      // clean up
      fse.remove(unpackingTempFolder).catch(Function);
      fse.unlink(tmpFile).catch(Function);
    }
  }

  renderInfo() {
    return (
      <div className="extensions-info flex column gaps">
        <h2>Lens Extension API</h2>
        <div>
          The Extensions API in Lens allows users to customize and enhance the Lens experience by creating their own menus or page content that is extended from the existing pages. Many of the core
          features of Lens are built as extensions and use the same Extension API.
        </div>
        <div>
          <p><em>Extensions loaded from:</em></p>
          <div className="extensions-path flex inline" onClick={() => shell.openPath(this.extensionsPath)}>
            <Icon material="folder" tooltip={{ children: "Open folder", preferredPositions: "bottom" }}/>
            <code>{this.extensionsPath}</code>
          </div>
        </div>
        <div className="install-extension flex column gaps">
          <em>
            Install extensions from tarball ({this.supportedFormats.join(", ")}):
          </em>
          <Input
            showErrorsAsTooltip={true}
            className="box grow"
            theme="round-black"
            placeholder="URL or npm-package-name"
            value={this.downloadUrl}
            onChange={v => this.downloadUrl = v}
            onSubmit={this.installExtensions}
          />
          <Button
            primary
            label="Add extensions"
            onClick={this.installExtensions}
          />
          <p className="hint">
            <Trans><b>Pro-Tip 1</b>: you can download packed extension from NPM via</Trans>
            <Clipboard showNotification>
              <code>npm pack %package-name</code>
            </Clipboard>
          </p>
          <p className="hint">
            <Trans><b>Pro-Tip 2</b>: you can drag & drop extension's tarball here to request installation</Trans>
          </p>
        </div>
        <div className="more-info flex inline gaps align-center">
          <Icon material="local_fire_department"/>
          <p>
            Check out documentation to <a href="https://docs.k8slens.dev/" target="_blank">learn more</a>
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
              placeholder={_i18n._(t`Search extensions`)}
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