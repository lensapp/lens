/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./install.module.scss";

import React, { useEffect, useState } from "react";
import { Button } from "../button";
import { Icon } from "../icon";
import { SearchInput } from "../input";
import { Spinner } from "../spinner";
import { Extension, getExtensions } from "./extension-list";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ExtensionInstallationStateStore } from "../../../extensions/extension-installation-state-store/extension-installation-state-store";
import installFromInputInjectable from "../+extensions/install-from-input/install-from-input.injectable";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import { observer } from "mobx-react";

export function Install() {
  const [extensions, setExtensions] = useState([]);

  useEffect(() => {
    async function fetchExtensions() {
      try {
        const response = await getExtensions();

        setExtensions(response);
      } catch (error) {
        console.error(error);
      }
    }

    fetchExtensions();
  }, []);

  const renderExtensionsOrSpinner = () => {
    if (!extensions.length) {
      return <Spinner/>;
    }

    return <ExtensionList extensions={extensions}/>;
  };

  return (
    <section>
      <h2>Install Extensions</h2>

      <div className="mt-4">
        <SearchInput theme="round-black"/>
      </div>

      <hr />

      <h2 style={{ marginTop: "30px", display: "flex", alignItems: "center" }}><Icon material="star" small style={{ opacity: ".3" }}/> Featured Extensions</h2>
      {renderExtensionsOrSpinner()}
    </section>
  );
}

function ExtensionList({ extensions }: { extensions: Extension[] }) {
  return (
    <>
      {extensions.map(extension => <ExtensionCard key={extension.id} extension={extension}/>)}
    </>
  );
}



interface Dependencies {
  installFromInput: (input: string) => Promise<void>;
  extensionInstallationStateStore: ExtensionInstallationStateStore;
}

interface CardProps {
  extension: Extension
}

function NonInjectedExtensionCard({ extension, extensionInstallationStateStore, installFromInput }: CardProps & Dependencies) {
  const { name, version, totalNumberOfInstallations, shortDescription, publisher, githubRepositoryUrl, appIconUrl } = extension;

  function onInstall() {
    installFromInput(extension.binaryUrl);
  }

  return (
    <div className={styles.extensionCard}>
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

export const ExtensionCard = withInjectables<Dependencies, CardProps>(
  observer(NonInjectedExtensionCard),
  {
    getProps: (di, props) => ({
      installFromInput: di.inject(installFromInputInjectable),
      extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),

      ...props,
    }),
  },
);
