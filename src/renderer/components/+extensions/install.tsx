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
import { Input, InputValidator, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import { TooltipPosition } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import installFromInputInjectable from "./install-from-input.injectable";
import installFromSelectFileDialogInjectable from "./install-from-select-file-dialog.injectable";
import isCurrentlyIdleInjectable from "../../extensions/installation-state/is-currently-idle.injectable";

export interface InstallProps {
  installPath: string;
  supportedFormats: string[];
  onChange: (path: string) => void;
}

interface Dependencies {
  isCurrentlyIdle: IComputedValue<boolean>;
  installFromInput: (input: string) => Promise<void>;
  installFromSelectFileDialog: () => Promise<void>;
}

const installInputValidators = [
  InputValidators.isUrl,
  InputValidators.isPath,
  InputValidators.isExtensionNameInstall,
];

const installInputValidator: InputValidator = {
  message: "Invalid URL, absolute path, or extension name",
  validate: (value: string) => (
    installInputValidators.some(({ validate }) => validate(value))
  ),
};

const NonInjectedInstall = observer(({
  installPath,
  supportedFormats,
  onChange,
  installFromInput,
  installFromSelectFileDialog,
  isCurrentlyIdle,
}: Dependencies & InstallProps) => {
  const showAsWaiting = isCurrentlyIdle.get();
  const formats = supportedFormats.join(", ");

  return (
    <section className="mt-2">
      <SubTitle title={`Name or file path or URL to an extension package (${formats})`} />
      <div className="flex">
        <div className="flex-1">
          <Input
            className="box grow mr-6"
            theme="round-black"
            disabled={showAsWaiting}
            placeholder={"Name or file path or URL"}
            showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
            validators={installPath ? installInputValidator : undefined}
            value={installPath}
            onChange={onChange}
            onSubmit={installFromInput}
            iconRight={
              <Icon
                className={styles.icon}
                material="folder_open"
                onClick={prevDefault(installFromSelectFileDialog)}
                tooltip="Browse"
              />
            }
          />
        </div>
        <div className="flex-initial">
          <Button
            primary
            label="Install"
            className="w-80 h-full"
            disabled={showAsWaiting}
            waiting={showAsWaiting}
            onClick={() => installFromInput(installPath)}
          />
        </div>
      </div>
      <small className="mt-3">
        <b>Pro-Tip</b>: you can drag-n-drop tarball-file to this area
      </small>
    </section>
  );
});

export const Install = withInjectables<Dependencies, InstallProps>(NonInjectedInstall, {
  getProps: (di, props) => ({
    isCurrentlyIdle: di.inject(isCurrentlyIdleInjectable),
    installFromInput: di.inject(installFromInputInjectable),
    installFromSelectFileDialog: di.inject(installFromSelectFileDialogInjectable),
    ...props,
  }),
});
