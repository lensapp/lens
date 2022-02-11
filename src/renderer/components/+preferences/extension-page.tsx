/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./extension-page.module.scss";

import React, { useEffect, useState } from "react";
import type { Extension, Review } from "./extension-directory-types";
import { Spinner } from "../spinner";
import { ExtensionCard } from "./extension-card";
import { matchPath, Route, RouteProps, Switch, useLocation } from "react-router";
import { MarkdownViewer } from "../markdown-viewer";
import { Tab, Tabs } from "../tabs";
import { navigate } from "../../navigation";
import { extensionPageRoute, extensionReviewsRoute } from "../../../common/routes";
import { Avatar } from "../avatar";
import { Rating } from "@material-ui/lab";

export function ExtensionPage() {
  const [extension, setExtension] = useState<Extension>(null);
  const [description, setDescription] = useState<string>("");
  const isActive = (route: RouteProps) => !!matchPath(location.pathname, { path: route.path, exact: true });
  const location = useLocation();
  const id = location.search.replace("?id=", "");

  useEffect(() => {
    async function fetchExtension() {
      const response = await fetch(`http://localhost:65113/api/extensions/${id}/`, {
        method: "GET",
      });

      return await response.json();
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
    return <Spinner center/>;
  }

  return (
    <section className="page">
      <ExtensionCard extension={extension}/>
      <hr />
      <Tabs scrollable={false} onChange={(url) => {
        navigate(url);
      }}>
        <Tab
          value={`/preferences/extension/${extension.id}/overview`}
          label="Overview"
          active={isActive(extensionPageRoute)}
        />
        <Tab
          value={`/preferences/extension/${extension.id}/reviews`}
          label="Rating & Review"
          active={isActive(extensionReviewsRoute)}
        />
      </Tabs>


      <Switch>
        <Route path={`/preferences/extension/:extensionId?/overview`}>
          <Overview extension={extension} description={description}/>
        </Route>
        <Route path={`/preferences/extension/:extensionId?/reviews`}>
          <Reviews reviews={extension.reviews}/>
        </Route>
      </Switch>
    </section>
  );
}

function Overview({ extension, description }: { extension: Extension, description: string }) {
  return (
    <div className={styles.contents}>
      <div className="github">
        <MarkdownViewer markdown={description} />
      </div>
      <div className={styles.metadata}>
        <h3 className="mb-5">Categories</h3>
        <div className={styles.links}>
          {extension.categories.map(category => (
            <a key={`category-${category.id}`} href="#">{category.name}</a>
          ))}
        </div>
        <h3 className="mb-5 mtp-5">Tags</h3>
        <div className={styles.links}>
          {extension.tags.map(tag => (
            <a key={`tag-${tag.id}`} href="#">{tag.name}</a>
          ))}
        </div>
        <h3 className="mb-5 mtp-5">More Info</h3>
        <div className="moreInfo"></div>
      </div>
    </div>
  );
}

function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <div className={styles.reviews}>
      <h2>User reviews</h2>

      {reviews.map(review => (
        <div key={review.id} className={styles.review}>
          <div className="avatar">
            <Avatar
              title={review.user}
              size={32}
            />
          </div>
          <div className="content">
            <div className={styles.userName}><b>{review.user}</b></div>
            <div className="mb-4">
              <Rating name="read-only" value={Math.floor(Math.random() * 5) + 1} readOnly />
            </div>
            <div className="text">
              {review.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
