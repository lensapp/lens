/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./install.module.scss";

import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Icon } from "../icon";
import { SearchInput } from "../input";
import { Spinner } from "../spinner";
import { ExtensionCard } from "./extension-card";
import type { Extension } from "./extension-directory-types";

export function Install() {
  const [extensions, setExtensions] = useState([]);
  const [search, setSearch] = useState<string>("");
  const query = search.toLowerCase();

  useEffect(() => {
    async function fetchExtensions() {
      try {
        const response = await fetch("http://localhost:65113/api/extensions/", {
          method: "GET",
        });

        const extensions = await response.json();

        setExtensions(extensions.reverse());
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

    return <ExtensionList extensions={extensions} search={query}/>;
  };

  return (
    <section>
      <h2>Install Extensions</h2>

      <div className="mt-4">
        <SearchInput theme="round-black" className={styles.searchInput} style={{ boxShadow: "none" }} value={search} onChange={setSearch}/>
      </div>

      <hr />

      <h2 style={{ marginTop: "30px", display: "flex", alignItems: "center" }}><Icon material="star" small style={{ opacity: ".3" }}/>&nbsp;Featured Extensions</h2>
      {renderExtensionsOrSpinner()}
    </section>
  );
}

function ExtensionList({ extensions, search }: { extensions: Extension[], search?: string }) {
  const history = useHistory();
  const filteredExtensions = extensions.filter((extension) => (
    extension.name.toLowerCase().includes(search)
  ));

  function handleClick(extensionId: string) {
    history.push(`extension/${extensionId}/overview?id=${extensionId}`);
  }

  if (!filteredExtensions.length) {
    return (
      <div className={styles.noResults}>
        <Icon material="search"/>&nbsp;No extension results for {search}
      </div>
    );
  }

  return (
    <>
      {filteredExtensions.map(extension => (
        <ExtensionCard key={extension.id} extension={extension} onClick={() => handleClick(extension.id)}/>
      ))}
    </>
  );
}
