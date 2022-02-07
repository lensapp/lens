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
      <h2><Icon material="add"/> Install Extensions</h2>

      <div className="mt-4">
        <SearchInput/>
      </div>

      <div className="mx-7">
        <hr />
      </div>

      <h2><Icon material="star"/> Featured Extensions</h2>
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
  const { name, version, totalNumberOfInstallations, shortDescription, publisher } = extension;

  return (
    <div className={styles.ExtensionCard}>
      <div className="head">
        <div className="nameAndVersion">
          <div className="name">{name}</div>
          <div className="version">{version}</div>
        </div>

        <div className="downloads">
          <Icon material="cloud_download"/> {totalNumberOfInstallations}
        </div>
      </div>

      <div className="description">
        {shortDescription}
      </div>

      <div className="footer">
        <div className="author">
          <img src="https://avatars.githubusercontent.com/u/455844?v=4"/> {publisher.username}
        </div>
        <div className="install">
          <Button primary><Icon material="cloud_download"/> Install</Button>
        </div>
      </div>
    </div>
  );
}
