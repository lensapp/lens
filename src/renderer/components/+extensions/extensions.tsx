/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./extensions.scss";
import type {
  IComputedValue } from "mobx";
import {
  makeObservable,
  observable,
  reaction,
  when,
} from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import type { InstalledExtension } from "../../../extensions/extension-discovery/extension-discovery";
import { DropFileInput } from "../input";
import { Install } from "./install";
import { InstalledExtensions } from "./installed-extensions";
import { Notice } from "./notice";
import { SettingLayout } from "../layout/setting-layout";
import { docsUrl } from "../../../common/vars";
import { withInjectables } from "@ogre-tools/injectable-react";

import userExtensionsInjectable from "./user-extensions/user-extensions.injectable";
import enableExtensionInjectable from "./enable-extension/enable-extension.injectable";
import disableExtensionInjectable from "./disable-extension/disable-extension.injectable";
import confirmUninstallExtensionInjectable from "./confirm-uninstall-extension/confirm-uninstall-extension.injectable";
import installFromInputInjectable from "./install-from-input/install-from-input.injectable";
import installFromSelectFileDialogInjectable from "./install-from-select-file-dialog.injectable";
import type { LensExtensionId } from "../../../extensions/lens-extension";
import installOnDropInjectable from "./install-on-drop/install-on-drop.injectable";
import { supportedExtensionFormats } from "./supported-extension-formats";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import type { ExtensionInstallationStateStore } from "../../../extensions/extension-installation-state-store/extension-installation-state-store";

interface Dependencies {
  userExtensions: IComputedValue<InstalledExtension[]>;
  enableExtension: (id: LensExtensionId) => void;
  disableExtension: (id: LensExtensionId) => void;
  confirmUninstallExtension: (extension: InstalledExtension) => Promise<void>;
  installFromInput: (input: string) => Promise<void>;
  installFromSelectFileDialog: () => Promise<void>;
  installOnDrop: (files: File[]) => Promise<void>;
  extensionInstallationStateStore: ExtensionInstallationStateStore;
}

@observer
class NonInjectedExtensions extends React.Component<Dependencies> {
  @observable installPath = "";

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.userExtensions.get().length, (curSize, prevSize) => {
        if (curSize > prevSize) {
          disposeOnUnmount(this, [
            when(() => !this.props.extensionInstallationStateStore.anyInstalling, () => this.installPath = ""),
          ]);
        }
      }),
    ]);
  }

  render() {
    const userExtensions = this.props.userExtensions.get();

    return (
      <DropFileInput onDropFiles={this.props.installOnDrop}>
        <SettingLayout
          className="Extensions"
          contentGaps={false}
          data-testid="extensions-page"
        >
          <section>
            <h1>Extensions</h1>

            <Notice className="mb-14 mt-3">
              <p>
                {"Add new features via Lens Extensions. Check out the "}
                <a
                  href={`${docsUrl}/extensions/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  docs
                </a>
                {" and list of "}
                <a
                  href="https://github.com/lensapp/lens-extensions/blob/main/README.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  available extensions
                </a>
                .
              </p>
            </Notice>

            <Install
              supportedFormats={supportedExtensionFormats}
              onChange={value => (this.installPath = value)}
              installFromInput={() => this.props.installFromInput(this.installPath)}
              installFromSelectFileDialog={this.props.installFromSelectFileDialog}
              installPath={this.installPath}
            />

            {userExtensions.length > 0 && <hr />}

            <InstalledExtensions
              extensions={userExtensions}
              enable={this.props.enableExtension}
              disable={this.props.disableExtension}
              uninstall={this.props.confirmUninstallExtension}
            />
          </section>
        </SettingLayout>
      </DropFileInput>
    );
  }
}

export const Extensions = withInjectables<Dependencies>(NonInjectedExtensions, {
  getProps: (di) => ({
    userExtensions: di.inject(userExtensionsInjectable),
    enableExtension: di.inject(enableExtensionInjectable),
    disableExtension: di.inject(disableExtensionInjectable),
    confirmUninstallExtension: di.inject(confirmUninstallExtensionInjectable),
    installFromInput: di.inject(installFromInputInjectable),
    installOnDrop: di.inject(installOnDropInjectable),
    installFromSelectFileDialog: di.inject(installFromSelectFileDialogInjectable),
    extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
  }),
});
