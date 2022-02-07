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
      <h2><Icon material="add" style={{ opacity: ".3" }}/> Install Extensions</h2>

      <div className="mt-4">
        <SearchInput/>
      </div>

      <hr />

      <h2 style={{ marginTop: "30px" }}><Icon material="star" small style={{ opacity: ".3" }}/> Featured Extensions</h2>
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

function ExtensionCard({ extension }: { extension: Extension }) {
  const { name, version, totalNumberOfInstallations, shortDescription, publisher, githubRepositoryUrl, appIconUrl } = extension;

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
            <Button primary><Icon className={styles.installButtonIco} material="cloud_download"/> Install</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
