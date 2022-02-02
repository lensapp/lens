/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Button } from "../button";
import { Icon } from "../icon";
import { SearchInput } from "../input";

interface Extension {
  id: string;
  name: string;
  description: string;
  version: string;
  downloads: number;
  author: string;
  iconUrl?: string;
}

export function Install() {
  const extension: Extension = {
    id: "resourcemap",
    name: "Lens Resource Map",
    description: "Lens Resource Map is an extension for Lens - The Kubernetes IDE that displays Kubernetes resources and their relations as a real-time force-directed graph.",
    version: "1.0.1",
    downloads: 12400,
    author: "nevalla",
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

      <ExtensionList extensions={[extension]}/>
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
  const { name, version, downloads, description, author } = extension;

  return (
    <div className="ExtensionCard">
      <div className="head">
        <div className="nameAndVersion">
          <div className="name">{name}</div>
          <div className="version">{version}</div>
        </div>

        <div className="downloads">
          <Icon material="cloud_download"/> {downloads}
        </div>
      </div>

      <div className="description">
        {description}
      </div>

      <div className="footer">
        <div className="author">
          <img src="https://avatars.githubusercontent.com/u/455844?v=4"/> {author}
        </div>
        <div className="install">
          <Button primary><Icon material="cloud_download"/> Install</Button>
        </div>
      </div>
    </div>
  );
}
