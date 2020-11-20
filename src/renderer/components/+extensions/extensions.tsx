import "./extensions.scss";
import { remote, shell } from "electron";
import path from "path";
import fse from "fs-extra";
import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Button } from "../button";
import { WizardLayout } from "../layout/wizard-layout";
import { DropFileInput, Input, InputValidators } from "../input";
import { Icon } from "../icon";
import { PageLayout } from "../layout/page-layout";
import { Clipboard } from "../clipboard";
import { extensionLoader } from "../../../extensions/extension-loader";
import { extensionManager } from "../../../extensions/extension-manager";
import { Notifications } from "../notifications";
import request from "request";
import logger from "../../../main/logger";

@observer
export class Extensions extends React.Component {
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

  selectLocalExtensionsDialog = async () => {
    const supportedFormats = [".tgz", ".tar.gz"]
    const { dialog, BrowserWindow, app } = remote;
    const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      defaultPath: app.getPath("downloads"),
      properties: ["openFile", "multiSelections"],
      message: _i18n._(t`Select extensions to install (supported formats: ${supportedFormats.join(", ")}), `),
      buttonLabel: _i18n._(t`Use configuration`),
      filters: [
        { name: "tarball", extensions: supportedFormats }
      ]
    });
    if (!canceled && filePaths.length) {
      this.installFromSelectFileDialog(filePaths);
    }
  }

  // fixme: doesn't work
  // todo: move to common/utils
  async downloadFile(url: string, fileName = path.basename(url)): Promise<File> {
    return new Promise((resolve, reject) => {
      const downloadingReq = request(url, { gzip: true });
      downloadingReq.on("complete", (res, body: Buffer) => {
        resolve(new File([body], fileName));
      });
      downloadingReq.on("error", reject);
    })
  }

  installFromUrl = async () => {
    const { downloadUrl } = this;
    if (!downloadUrl) {
      return;
    }
    let tarballUrl: string;
    if (InputValidators.isUrl.validate(downloadUrl)) {
      tarballUrl = downloadUrl;
    } else {
      try {
        tarballUrl = extensionManager.getNpmPackageTarballUrl(downloadUrl);
      } catch (err) {
        Notifications.error(`Error: npm package "${downloadUrl}" not found`);
        return;
      }
    }
    logger.info('Install from packed extension URL', { tarballUrl });
    if (tarballUrl) {
      try {
        const file = await this.downloadFile(tarballUrl);
        this.installExtensionFromFile([file]);
      } catch (err) {
        Notifications.error(`Installing extension from ${tarballUrl} has failed: ${String(err)}`);
      }
    }
  }

  installFromSelectFileDialog = async (filePaths: string[]) => {
    logger.info('Install from select dialog', { filePaths });
    const files: File[] = await Promise.all(
      filePaths.map(filePath => {
        const fileName = path.basename(filePath);
        return fse.readFile(filePath).then(buffer => new File([buffer], fileName));
      })
    );
    return this.installExtensionFromFile(files);
  }

  installOnDrop = (files: File[]) => {
    logger.info('Install from D&D', { files });
    return this.installExtensionFromFile(files);
  }

  // todo
  async installExtensionFromFile(files: File[]) {
    console.log(`Install files:`, files);
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
          <p><em>Install extensions from archive (tarball.tgz):</em></p>
          <div className="install-extension-by-url flex gaps align-center">
            <Input
              showErrorsAsTooltip={true}
              className="box grow"
              theme="round-black"
              placeholder="URL or NPM package name"
              value={this.downloadUrl}
              onChange={v => this.downloadUrl = v}
              onSubmit={this.installFromUrl}
            />
            <Icon
              material="get_app"
              tooltip={{ children: "Install", preferredPositions: "bottom" }}
              interactive={this.downloadUrl.length > 0}
              onClick={this.installFromUrl}
            />
          </div>
          <Button
            primary
            label="Select local extensions"
            onClick={this.selectLocalExtensionsDialog}
          />
          <p className="hint">
            <Trans><b>Pro-Tip 1</b>: you can download NPM-package to local folder with</Trans>
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
            <Input
              autoFocus
              theme="round-black"
              className="SearchInput"
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