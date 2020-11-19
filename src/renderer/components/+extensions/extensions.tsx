import "./extensions.scss";
import { remote, shell } from "electron";
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
import { CopyToClick } from "../copy-to-click/copy-to-click";
import { extensionLoader } from "../../../extensions/extension-loader";
import { extensionManager } from "../../../extensions/extension-manager";

@observer
export class Extensions extends React.Component {
  @observable.ref input: Input;
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
      message: _i18n._(t`Select extensions to install (supported: ${supportedFormats.join(", ")}), `),
      buttonLabel: _i18n._(t`Use configuration`),
      filters: [
        { name: "tarball", extensions: supportedFormats }
      ]
    });
    if (!canceled && filePaths.length) {
      this.installFromLocalPath(filePaths);
    }
  }

  // todo
  installFromUrl = () => {
    if (!this.downloadUrl) {
      this.input?.focus();
      return;
    }
    console.log('Install from URL', this.downloadUrl);
  }

  // todo
  installFromLocalPath = (filePaths: string[]) => {
    console.log('Install select from dialog', filePaths)
  }

  // todo
  installOnDrop = (files: File[]) => {
    console.log('Install from D&D', files);
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
          <em>All custom extensions located in:</em>
          <div className="extensions-path flex inline" onClick={() => shell.openPath(this.extensionsPath)}>
            <Icon material="folder" tooltip={{ children: "Open folder", preferredPositions: "bottom" }}/>
            <code>{this.extensionsPath}</code>
          </div>
        </div>
        <div className="install-extension flex column gaps">
          <em>Install extensions from local file-system or URL:</em>
          <div className="install-extension-by-url flex gaps align-center">
            <Icon
              material="get_app"
              tooltip={{ children: "Download and Install", preferredPositions: "bottom" }}
              interactive={this.downloadUrl.length > 0}
              onClick={this.installFromUrl}
            />
            <Input
              showErrorsAsTooltip={true}
              className="box grow"
              theme="round-black"
              placeholder="URL, e.g. https://registry.npmjs.org/%path-to-ext.tgz"
              validators={InputValidators.isUrl}
              value={this.downloadUrl} // TODO: in addition we could support npm-package-name (if non-url value)?
              onChange={v => this.downloadUrl = v}
              onSubmit={this.installFromUrl}
              ref={e => this.input = e}
            />
          </div>
          <Button
            primary
            label="Select local extensions"
            onClick={this.selectLocalExtensionsDialog}
          />
          <p className="hint">
            <Trans><b>Pro-Tip 1</b>: you can download extension archive.tgz via NPM:</Trans>
          </p>
          <ul>
            <CopyToClick showNotification selector="code">
              <li>
                <code>npm pack %name</code>
                <em> (click to copy)</em>
              </li>
            </CopyToClick>
            <CopyToClick showNotification selector="code">
              <li className="click-to-copy">
                <code>npm view %name dist.tarball</code>
                <em> (click to copy)</em>
              </li>
            </CopyToClick>
          </ul>
          <p className="hint">
            <Trans><b>Pro-Tip 2</b>: you also can drop archive from file-system to this window to request installation</Trans>
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