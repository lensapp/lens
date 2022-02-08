/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./extension-card.module.scss";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";

import installFromInputInjectable from "../+extensions/install-from-input/install-from-input.injectable";
import { Button } from "../button";
import { Icon } from "../icon";
import type { Extension } from "./extension-list";
import type { ExtensionInstallationStateStore } from "../../../extensions/extension-installation-state-store/extension-installation-state-store";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";

interface Dependencies {
  installFromInput: (input: string) => Promise<void>;
  extensionInstallationStateStore: ExtensionInstallationStateStore;
}

interface Props {
  extension: Extension;
  onClick?: () => void;
}

function NonInjectedExtensionCard({ extension, extensionInstallationStateStore, installFromInput, onClick }: Props & Dependencies) {
  const { name, version, totalNumberOfInstallations, shortDescription, publisher, githubRepositoryUrl, appIconUrl } = extension;

  function onInstall() {
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
              disabled={extensionInstallationStateStore.anyPreInstallingOrInstalling}
              waiting={extensionInstallationStateStore.anyPreInstallingOrInstalling}
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

      ...props,
    }),
  },
);
