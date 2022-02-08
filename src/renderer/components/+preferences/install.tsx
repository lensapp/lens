/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect, useState } from "react";
import { Icon } from "../icon";
import { SearchInput } from "../input";
import { Spinner } from "../spinner";
import { ExtensionCard } from "./extension-card";
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
