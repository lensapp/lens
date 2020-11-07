import "./extensions.scss";
import { shell } from "electron";
import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Button } from "../button";
import { WizardLayout } from "../layout/wizard-layout";
import { Input } from "../input";
import { Icon } from "../icon";
import { PageLayout } from "../layout/page-layout";
import { extensionLoader } from "../../../extensions/extension-loader";
import { extensionManager } from "../../../extensions/extension-manager";

@observer
export class Extensions extends React.Component {
  @observable search = ""

  @computed get extensions() {
    const searchText = this.search.toLowerCase();
    return Array.from(extensionLoader.userExtensions.values()).filter(ext => {
      const { name, description } = ext.manifest;
      return [
        name.toLowerCase().includes(searchText),
        description.toLowerCase().includes(searchText),
      ].some(v => v)
    })
  }

  get extensionsPath() {
    return extensionManager.localFolderPath;
  }

  renderInfo() {
    return (
      <div className="flex column gaps">
        <h2>Lens Extension API</h2>
        <div>
          The Extensions API in Lens allows users to customize and enhance the Lens experience by creating their own menus or page content that is extended from the existing pages. Many of the core
          features of Lens are built as extensions and use the same Extension API.
        </div>
        <div>
          Extensions loaded from:
          <div className="extensions-path flex inline">
            <code>{this.extensionsPath}</code>
            <Icon
              material="folder"
              tooltip="Open folder"
              onClick={() => shell.openPath(this.extensionsPath)}
            />
          </div>
        </div>
        <div>
          Check out documentation to <a href="https://docs.k8slens.dev/" target="_blank">learn more</a>
        </div>
      </div>
    )
  }

  renderExtensions() {
    const { extensions, extensionsPath, search } = this;
    if (!extensions.length) {
      return (
        <div className="flex align-center box grow justify-center gaps">
          {search && <Trans>No search results found</Trans>}
          {!search && <p><Trans>There are no extensions in</Trans> <code>{extensionsPath}</code></p>}
        </div>
      )
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
      )
    })
  }

  render() {
    return (
      <PageLayout showOnTop className="Extensions" header={<h2>Extensions</h2>}>
        <WizardLayout infoPanel={this.renderInfo()}>
          <Input
            autoFocus
            theme="round-black"
            className="SearchInput"
            placeholder={_i18n._(t`Search extensions`)}
            value={this.search}
            onChange={(value) => this.search = value}
          />
          <div className="extension-list">
            {this.renderExtensions()}
          </div>
        </WizardLayout>
      </PageLayout>
    );
  }
}