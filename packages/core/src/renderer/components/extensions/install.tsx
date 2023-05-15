/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./install.module.scss";
import React, { useEffect, useRef, useState } from "react";
import { prevDefault } from "@k8slens/utilities";
import { Button } from "@k8slens/button";
import { Icon } from "@k8slens/icon";
import { observer } from "mobx-react";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import { TooltipPosition } from "@k8slens/tooltip";
import type { ExtensionInstallationStateStore } from "../../../extensions/extension-installation-state-store/extension-installation-state-store";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import { unionInputValidatorsAsync } from "../input/input_validators";
import { supportedExtensionFormats } from "./supported-extension-formats";
import type { InstallExtensionFromInput } from "./install-extension-from-input.injectable";
import type { InstallFromSelectFileDialog } from "./install-from-select-file-dialog.injectable";
import installExtensionFromInputInjectable from "./install-extension-from-input.injectable";
import installFromSelectFileDialogInjectable from "./install-from-select-file-dialog.injectable";

interface Dependencies {
  installState: ExtensionInstallationStateStore;
  installExtensionFromInput: InstallExtensionFromInput;
  installFromSelectFileDialog: InstallFromSelectFileDialog;
}

const installInputValidator = unionInputValidatorsAsync(
  {
    message: "Invalid URL, absolute path, or extension name",
  },
  InputValidators.isUrl,
  InputValidators.isExtensionNameInstall,
  InputValidators.isPath,
);

const installTitle = `Name or file path or URL to an extension package (${supportedExtensionFormats.join(", ")})`;

const NonInjectedInstall = observer(({
  installExtensionFromInput,
  installFromSelectFileDialog,
  installState,
}: Dependencies) => {
  const [installPath, setInstallPath] = useState("");
  const prevAnyInstalling = useRef(installState.anyInstalling);

  useEffect(() => {
    const currentlyInstalling = installState.anyInstalling;
    const previouslyInstalling = prevAnyInstalling.current;

    if (!currentlyInstalling && previouslyInstalling) {
      prevAnyInstalling.current = false;
      setInstallPath("");
    }
  }, [installState.anyInstalling]);

  return (
    <section>
      <SubTitle title={installTitle} />
      <div className={styles.inputs}>
        <div>
          <Input
            theme="round-black"
            disabled={installState.anyPreInstallingOrInstalling}
            placeholder="Name or file path or URL"
            showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
            validators={installPath ? installInputValidator : undefined}
            value={installPath}
            onChange={setInstallPath}
            onSubmit={() => installExtensionFromInput(installPath)}
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
            disabled={installState.anyPreInstallingOrInstalling}
            waiting={installState.anyPreInstallingOrInstalling}
            onClick={() => installExtensionFromInput(installPath)}
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

export const ExtensionInstall = withInjectables<Dependencies>(NonInjectedInstall, {
  getProps: (di, props) => ({
    ...props,
    installState: di.inject(extensionInstallationStateStoreInjectable),
    installExtensionFromInput: di.inject(installExtensionFromInputInjectable),
    installFromSelectFileDialog: di.inject(installFromSelectFileDialogInjectable),
  }),
});
