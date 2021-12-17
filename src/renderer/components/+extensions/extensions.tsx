/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./extensions.scss";
import {
  IComputedValue,
  makeObservable,
  observable,
  reaction,
  when,
} from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import type { InstalledExtension } from "../../../extensions/extension-discovery";
import { DropFileInput } from "../input";
import { ExtensionInstallationStateStore } from "./extension-install.store";
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
import installFromSelectFileDialogInjectable from "./install-from-select-file-dialog/install-from-select-file-dialog.injectable";
import type { LensExtensionId } from "../../../extensions/lens-extension";
import installOnDropInjectable from "./install-on-drop/install-on-drop.injectable";
import { supportedExtensionFormats } from "./supported-extension-formats";

interface Dependencies {
  userExtensions: IComputedValue<InstalledExtension[]>;
  enableExtension: (id: LensExtensionId) => void;
  disableExtension: (id: LensExtensionId) => void;
  confirmUninstallExtension: (extension: InstalledExtension) => Promise<void>;
  installFromInput: (input: string) => Promise<void>;
  installFromSelectFileDialog: () => Promise<void>;
  installOnDrop: (files: File[]) => Promise<void>;
}

@observer
class NonInjectedExtensions extends React.Component<Dependencies> {
  @observable installPath = "";

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  get dependencies() {
    return this.props.dependencies;
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.userExtensions.get().length, (curSize, prevSize) => {
        if (curSize > prevSize) {
          disposeOnUnmount(this, [
            when(() => !ExtensionInstallationStateStore.anyInstalling, () => this.installPath = ""),
          ]);
        }
      }),
    ]);
  }

  render() {
    const userExtensions = this.props.userExtensions.get();

    return (
      <DropFileInput onDropFiles={this.props.installOnDrop}>
        <SettingLayout className="Extensions" contentGaps={false}>
          <section>
            <h1>Extensions</h1>

            <Notice className="mb-14 mt-3">
              <p>
                Add new features via Lens Extensions.{" "}
                Check out <a href={`${docsUrl}/extensions/`} target="_blank" rel="noreferrer">docs</a>{" "}
                and list of <a href="https://github.com/lensapp/lens-extensions/blob/main/README.md" target="_blank" rel="noreferrer">available extensions</a>.
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

export const Extensions = withInjectables<Dependencies>(
  NonInjectedExtensions,
  {
    getProps: (di) => ({
      userExtensions: di.inject(userExtensionsInjectable),
      enableExtension: di.inject(enableExtensionInjectable),
      disableExtension: di.inject(disableExtensionInjectable),
      confirmUninstallExtension: di.inject(confirmUninstallExtensionInjectable),
      installFromInput: di.inject(installFromInputInjectable),
      installOnDrop: di.inject(installOnDropInjectable),

      installFromSelectFileDialog: di.inject(
        installFromSelectFileDialogInjectable,
      ),
    }),
  },
);
