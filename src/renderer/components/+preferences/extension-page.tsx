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
import { MarkdownViewer } from "../markdown-viewer";

export function ExtensionPage() {
  const [extension, setExtension] = useState<Extension>(null);
  const [description, setDescription] = useState<string>("");
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    async function fetchExtension() {
      return await getExtensionById(id);
    }

    async function loadData() {
      try {
        const extension = await fetchExtension();
        const readmeUrl = `${extension.githubRepositoryUrl.replace("github.com", "raw.githubusercontent.com")}/master/README.md`;
        const description = await (await fetch(readmeUrl)).text();

        setExtension(extension);
        setDescription(description);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);

  if (!extension || !description) {
    return <Spinner/>;
  }

  return (
    <section className="page">
      <ExtensionCard extension={extension}/>
      <hr />
      <div className={styles.contents}>
        <div className="github">
          <MarkdownViewer markdown={description} />
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
