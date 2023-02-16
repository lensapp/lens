/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./install.module.scss";
import React from "react";
import { prevDefault } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import { TooltipPosition } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import { unionInputValidatorsAsync } from "../input/input_validators";
import type { IComputedValue } from "mobx";
import extensionsInstallingCountInjectable from "../../../features/extensions/installation-states/renderer/installing-count.injectable";
import extensionsPreinstallingCountInjectable from "../../../features/extensions/installation-states/renderer/preinstalling-count.injectable";
import { observer } from "mobx-react";

export interface InstallProps {
  installPath: string;
  supportedFormats: string[];
  onChange: (path: string) => void;
  installFromInput: () => void;
  installFromSelectFileDialog: () => void;
}

interface Dependencies {
  extensionsInstallingCount: IComputedValue<number>;
  extensionsPreinstallingCount: IComputedValue<number>;
}

const installInputValidator = unionInputValidatorsAsync(
  {
    message: "Invalid URL, absolute path, or extension name",
  },
  InputValidators.isUrl,
  InputValidators.isExtensionNameInstall,
  InputValidators.isPath,
);

const NonInjectedInstall = observer(({
  installPath,
  supportedFormats,
  onChange,
  installFromInput,
  installFromSelectFileDialog,
  extensionsInstallingCount,
  extensionsPreinstallingCount,
}: Dependencies & InstallProps) => {
  const anyPreInstallingOrInstalling = extensionsInstallingCount.get() > 0 || extensionsPreinstallingCount.get() > 0;

  return (
    <section>
      <SubTitle
        title={`Name or file path or URL to an extension package (${supportedFormats.join(", ")})`}
      />
      <div className={styles.inputs}>
        <div>
          <Input
            theme="round-black"
            disabled={anyPreInstallingOrInstalling}
            placeholder={"Name or file path or URL"}
            showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
            validators={installPath ? installInputValidator : undefined}
            value={installPath}
            onChange={onChange}
            onSubmit={installFromInput}
            iconRight={(
              <Icon
                className={styles.icon}
                smallest
                material="folder_open"
                onClick={prevDefault(installFromSelectFileDialog)}
                tooltip="Browse"
              />
            )}
          />
        </div>
        <div>
          <Button
            className={styles.button}
            primary
            label="Install"
            disabled={anyPreInstallingOrInstalling}
            waiting={anyPreInstallingOrInstalling}
            onClick={installFromInput}
          />
        </div>
      </div>
      <small className={styles.proTip}>
        <b>Pro-Tip</b>
        : you can drag and drop a tarball file to this area
      </small>
    </section>
  );
});

export const Install = withInjectables<Dependencies, InstallProps>(NonInjectedInstall, {
  getProps: (di, props) => ({
    ...props,
    extensionsInstallingCount: di.inject(extensionsInstallingCountInjectable),
    extensionsPreinstallingCount: di.inject(extensionsPreinstallingCountInjectable),
  }),
});
