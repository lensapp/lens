/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./extension-page.module.scss";

import React, { useEffect, useState } from "react";
import { Extension, getExtensionById } from "./extension-list";
import { Spinner } from "../spinner";
import { ExtensionCard } from "./extension-card";
import { useParams } from "react-router";

export function ExtensionPage() {
  const [extension, setExtension] = useState<Extension>(null);
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    async function fetchExtension() {
      try {
        const response = await getExtensionById(id);

        setExtension(response);
      } catch (error) {
        console.error(error);
      }
    }

    async function fetchGithubDescription() {
      const description = await fetch("https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md");

      console.log(await description.text());
    }

    fetchExtension();
    fetchGithubDescription();
  }, []);

  if (!extension) {
    return <Spinner/>;
  }

  return (
    <section className="page">
      <ExtensionCard extension={extension}/>
      <hr />
      <div className={styles.contents}>
        <div className="github">
          GitHub description
        </div>
        <div className="metadata">
          <h3 className="mb-5">Categories</h3>
          <div className="links">
            {extension.category.map(category => (
              <a key={`category-${category.id}`} href="#">{category.name}</a>
            ))}
          </div>
          <h3 className="mb-5 mtp-5">Tags</h3>
          <div className="links">
            {extension.tags.map(tag => (
              <a key={`tag-${tag.id}`} href="#">{tag.name}</a>
            ))}
          </div>
          <h3 className="mb-5 mtp-5">More Info</h3>
          <div className="moreInfo"></div>
        </div>
      </div>
    </section>
  );
}
