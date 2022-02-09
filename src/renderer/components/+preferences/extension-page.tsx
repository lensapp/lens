/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./extension-page.module.scss";

import React, { useEffect, useState } from "react";
import { Extension, getExtensionById, getReviewsExtensionById, Review } from "./extension-list";
import { Spinner } from "../spinner";
import { ExtensionCard } from "./extension-card";
import { matchPath, Route, RouteProps, Switch, useParams } from "react-router";
import { MarkdownViewer } from "../markdown-viewer";
import { Tab, Tabs } from "../tabs";
import { navigate } from "../../navigation";
import { extensionPageRoute, extensionReviewsRoute } from "../../../common/routes";

export function ExtensionPage() {
  const [extension, setExtension] = useState<Extension>(null);
  const [description, setDescription] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const { id } = useParams<{ id?: string }>();
  const isActive = (route: RouteProps) => !!matchPath(location.pathname, { path: route.path, exact: true });

  useEffect(() => {
    async function fetchExtension() {
      return await getExtensionById(id);
    }

    async function fetchReviews() {
      return await getReviewsExtensionById(id);
    }

    async function loadData() {
      try {
        const extension = await fetchExtension();
        const readmeUrl = `${extension.githubRepositoryUrl.replace("github.com", "raw.githubusercontent.com")}/master/README.md`;
        const description = await (await fetch(readmeUrl)).text();
        const reviews = await fetchReviews();

        setExtension(extension);
        setDescription(description);
        setReviews(reviews);
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


      <div className={styles.contents}>
        <Switch>
          <Route path={`/preferences/extension/:extensionId?/overview`}>
            <Overview extension={extension} description={description}/>
          </Route>
          <Route path={`/preferences/extension/:extensionId?/reviews`}>
            <Reviews reviews={reviews}/>
          </Route>
        </Switch>
      </div>
    </section>
  );
}

function Overview({ extension, description }: { extension: Extension, description: string }) {
  return (
    <>
      <div className="github">
        <MarkdownViewer markdown={description} />
      </div>
      <div className={styles.metadata}>
        <h3 className="mb-5">Categories</h3>
        <div className={styles.links}>
          {extension.category.map(category => (
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
    </>
  );
}

function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <div className="reviews">
      <h2>User reviews</h2>

      {reviews.map(review => (
        <div key={review.id} className="review">
          <div className="avatar">

          </div>
          <div className="content">
            <div className="mb-4"><b>{review.user.firstName} {review.user.lastName}</b></div>
            <div className="rating">rating</div>
            <div className="text">
              {review.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
