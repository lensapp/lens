import "./extensions.scss";
import React, { Fragment } from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Button } from "../button";
import { WizardLayout } from "../layout/wizard-layout";
import { Input } from "../input";
import { extensionLoader } from "../../../extensions/extension-loader";
import { extensionManager } from "../../../extensions/extension-manager";

@observer
export class Extensions extends React.Component {
  @observable search = ""

  @computed get extensions() {
    const extensions = extensionLoader.userExtensions
    return extensions.filter(ext => ext.name.includes(this.search))
  }

  disable(name: string) {
  }

  renderInfo() {
    return (
      <Fragment>
        <h2>Lens Extension API</h2>
        <p>
          The Extensions API in Lens allows users to customize and enhance the Lens experience by creating their own menus or page content that is extended from the existing pages. Many of the core
          features of Lens are built as extensions and use the same Extension API.
        </p>
        <p>
          Check out documentation to <a href="https://docs.k8slens.dev/" target="_blank">learn more</a>
        </p>
      </Fragment>
    )
  }

  renderExtensions() {
    const extensionsPath = extensionManager.localFolderPath;
    const { extensions, search } = this;
    if (!extensions.length) {
      return (
        <div className="flex align-center box grow justify-center gaps">
          {search && <Trans>No search results found</Trans>}
          {!search && <p>There are no extensions in <code>{extensionsPath}</code></p>}
        </div>
      )
    }
    return extensions.map(({ id, name, description }) => {
      return (
        <div key={id} className="extension flex gaps align-center">
          <div className="box grow flex column gaps">
            <code className="name">{name}</code>
            <span className="description">{description}</span>
          </div>
          <Button plain active onClick={() => this.disable(name)}>
            Disable
          </Button>
        </div>
      )
    })
  }

  render() {
    return (
      <WizardLayout className="Extensions" infoPanel={this.renderInfo()}>
        <h2><Trans>Extensions</Trans></h2>
        <div className="extension-list">
          {/* TODO: Use generic search input after https://github.com/lensapp/lens/pull/1114 will be pushed */}
          <Input
            autoFocus
            theme="round-black"
            className="SearchInput"
            placeholder={_i18n._(t`Search extensions`)}
            value={this.search}
            onChange={(value) => this.search = value}
          />
          {this.renderExtensions()}
        </div>
      </WizardLayout>
    );
  }
}