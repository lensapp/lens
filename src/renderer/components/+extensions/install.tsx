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

import styles from "./install.module.css";
import React from "react";
import { prevDefault } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { Input, InputValidator, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import { TooltipPosition } from "../tooltip";
import { ExtensionInstallationStateStore } from "./extension-install.store";
import { observer } from "mobx-react";

interface Props {
  installPath: string;
  supportedFormats: string[];
  onChange: (path: string) => void;
  installFromInput: () => void;
  installFromSelectFileDialog: () => void;
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

export const Install = observer((props: Props) => {
  const { installPath, supportedFormats, onChange, installFromInput, installFromSelectFileDialog } = props;

  return (
    <section className="mt-2">
      <SubTitle title={`Name or file path or URL to an extension package (${supportedFormats.join(", ")})`}/>
      <div className="flex">
        <div className="flex-1">
          <Input
            className="box grow mr-6"
            theme="round-black"
            disabled={ExtensionInstallationStateStore.anyPreInstallingOrInstalling}
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
            disabled={ExtensionInstallationStateStore.anyPreInstallingOrInstalling}
            waiting={ExtensionInstallationStateStore.anyPreInstallingOrInstalling}
            onClick={installFromInput}
          />
        </div>
      </div>
      <small className="mt-3">
        <b>Pro-Tip</b>: you can drag-n-drop tarball-file to this area
      </small>
    </section>
  );
});

