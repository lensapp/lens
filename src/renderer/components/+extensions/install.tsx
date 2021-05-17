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
      <SubTitle title={`Path or URL to an extension package (${supportedFormats.join(", ")})`}/>
      <div className="flex">
        <div className="flex-1">
          <Input
            className="box grow mr-6"
            theme="round-black"
            disabled={ExtensionInstallationStateStore.anyPreInstallingOrInstalling}
            placeholder={"File path or URL"}
            showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
            validators={installPath ? installInputValidator : undefined}
            value={installPath}
            onChange={onChange}
            onSubmit={installFromInput}
            iconRight={
              <Icon
                interactive={false}
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

