/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./install.module.scss";
import React from "react";
import { prevDefault } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { observer } from "mobx-react";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import { TooltipPosition } from "../tooltip";
import type { ExtensionInstallationStateStore } from "../../../extensions/extension-installation-state-store/extension-installation-state-store";
import extensionInstallationStateStoreInjectable
  from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import { inputValidator } from "../input/input_validators";

export interface InstallProps {
  installPath: string;
  supportedFormats: string[];
  onChange: (path: string) => void;
  installFromInput: () => void;
  installFromSelectFileDialog: () => void;
}

interface Dependencies {
  extensionInstallationStateStore: ExtensionInstallationStateStore;
}

const installInputValidators = [
  InputValidators.isUrl,
  InputValidators.isPath,
  InputValidators.isExtensionNameInstall,
];

const installInputValidator = inputValidator({
  message: "Invalid URL, absolute path, or extension name",
  validate: (value: string, props) => (
    installInputValidators.some(({ validate }) => validate(value, props))
  ),
});

const NonInjectedInstall: React.FC<Dependencies & InstallProps> = ({
  installPath,
  supportedFormats,
  onChange,
  installFromInput,
  installFromSelectFileDialog,
  extensionInstallationStateStore,
}) => (
  <section className="mt-2">
    <SubTitle
      title={`Name or file path or URL to an extension package (${supportedFormats.join(
        ", ",
      )})`}
    />
    <div className="flex">
      <div className="flex-1">
        <Input
          className="box grow mr-6"
          theme="round-black"
          disabled={
            extensionInstallationStateStore.anyPreInstallingOrInstalling
          }
          placeholder={"Name or file path or URL"}
          showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
          validators={installPath ? installInputValidator : undefined}
          value={installPath}
          onChange={onChange}
          onSubmit={installFromInput}
          iconRight={(
            <Icon
              className={styles.icon}
              material="folder_open"
              onClick={prevDefault(installFromSelectFileDialog)}
              tooltip="Browse"
            />
          )}
        />
      </div>
      <div className="flex-initial">
        <Button
          primary
          label="Install"
          className="w-80 h-full"
          disabled={
            extensionInstallationStateStore.anyPreInstallingOrInstalling
          }
          waiting={extensionInstallationStateStore.anyPreInstallingOrInstalling}
          onClick={installFromInput}
        />
      </div>
    </div>
    <small className="mt-3">
      <b>Pro-Tip</b>
      : you can drag-n-drop tarball-file to this area
    </small>
  </section>
);

export const Install = withInjectables<Dependencies, InstallProps>(
  observer(NonInjectedInstall),
  {
    getProps: (di, props) => ({
      extensionInstallationStateStore: di.inject(
        extensionInstallationStateStoreInjectable,
      ),

      ...props,
    }),
  },
);
