/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./extension-card.module.scss";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";

import installFromInputInjectable from "../+extensions/install-from-input/install-from-input.injectable";
import { Button } from "../button";
import { Icon } from "../icon";
import type { Extension } from "./extension-list";
import type { ExtensionInstallationStateStore } from "../../../extensions/extension-installation-state-store/extension-installation-state-store";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import type { IComputedValue } from "mobx";
import confirmUninstallExtensionInjectable from "../+extensions/confirm-uninstall-extension/confirm-uninstall-extension.injectable";
import disableExtensionInjectable from "../+extensions/disable-extension/disable-extension.injectable";
import enableExtensionInjectable from "../+extensions/enable-extension/enable-extension.injectable";
import userExtensionsInjectable from "../+extensions/user-extensions/user-extensions.injectable";
import type { InstalledExtension } from "../../../extensions/extension-discovery/extension-discovery";
import type { LensExtensionId } from "../../../extensions/lens-extension";

interface Dependencies {
  installFromInput: (input: string) => Promise<void>;
  extensionInstallationStateStore: ExtensionInstallationStateStore;
  userExtensions: IComputedValue<InstalledExtension[]>;
  enableExtension: (id: LensExtensionId) => void;
  disableExtension: (id: LensExtensionId) => void;
  confirmUninstallExtension: (extension: InstalledExtension) => Promise<void>;
}

interface Props {
  extension: Extension;
  onClick?: () => void;
}

function NonInjectedExtensionCard({
  extension,
  extensionInstallationStateStore: store,
  installFromInput,
  onClick,
  userExtensions,
}: Props & Dependencies) {
  const { name, version, totalNumberOfInstallations, shortDescription, publisher, githubRepositoryUrl, appIconUrl } = extension;
  const installedExtension = userExtensions.get().find(installed => installed.manifest.name == name);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!store.anyPreInstallingOrInstalling) {
      setWaiting(false);
    }
  }, [store.anyPreInstallingOrInstalling]);

  function onInstall(evt: React.MouseEvent) {
    evt.stopPropagation();
    setWaiting(true);
    installFromInput(extension.binaryUrl);
  }

  return (
    <div className={styles.extensionCard} onClick={onClick}>
      <div className={styles.icon} style={{ backgroundImage: `url(${appIconUrl})` }}/>
      <div className={styles.contents}>
        <div className={styles.head}>
          <div className={styles.nameAndVersion}>
            <div className={styles.name}>{name}</div>
            <div className={styles.version}>{version}</div>
          </div>

          <div className={styles.downloads}>
            <Icon material="cloud_download"/> {totalNumberOfInstallations}
          </div>
        </div>

        <div className={styles.description}>
          {shortDescription}
        </div>

        <div className={styles.footer}>
          <div className={styles.author}>
            <a href={githubRepositoryUrl} rel="noreferrer" target="_blank">{publisher.username}</a>
          </div>
          <div className={styles.install}>
            <Button
              primary
              waiting={waiting}
              disabled={store.anyPreInstallingOrInstalling}
              onClick={onInstall}
            >
              <Icon className={styles.installButtonIco} material="cloud_download"/>
              Install
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ExtensionCard = withInjectables<Dependencies, Props>(
  observer(NonInjectedExtensionCard),
  {
    getProps: (di, props) => ({
      installFromInput: di.inject(installFromInputInjectable),
      extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
      userExtensions: di.inject(userExtensionsInjectable),
      enableExtension: di.inject(enableExtensionInjectable),
      disableExtension: di.inject(disableExtensionInjectable),
      confirmUninstallExtension: di.inject(confirmUninstallExtensionInjectable),

      ...props,
    }),
  },
);
