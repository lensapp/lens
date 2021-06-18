/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { observable, reaction } from "mobx";
import { WeblinkStore } from "../../common/weblink-store";
import { WebLink } from "../../common/catalog-entities";
import { catalogEntityRegistry } from "../catalog";
import got from "got";
import logger from "../logger";
import { docsUrl, slackUrl } from "../../common/vars";

const defaultLinks = [
  { title: "Lens Website", url: "https://k8slens.dev" },
  { title: "Lens Documentation", url: docsUrl },
  { title: "Lens Community Slack", url: slackUrl },
  { title: "Kubernetes Documentation", url: "https://kubernetes.io/docs/home/" },
  { title: "Lens on Twitter", url: "https://twitter.com/k8slens" },
  { title: "Lens Official Blog", url: "https://medium.com/k8slens" }
].map((link) => (
  new WebLink({
    metadata: {
      uid: link.url,
      name: link.title,
      source: "app",
      labels: {}
    },
    spec: {
      url: link.url
    },
    status: {
      phase: "available",
      active: true
    }
  })
));

async function validateLink(link: WebLink) {
  try {
    const response = await got.get(link.spec.url, {
      throwHttpErrors: false
    });

    if (response.statusCode >= 200 && response.statusCode < 500) {
      link.status.phase = "available";
    } else {
      link.status.phase = "unavailable";
    }
  } catch(error) {
    link.status.phase = "unavailable";
  }
}


export function initializeWeblinks() {
  const weblinkStore = WeblinkStore.getInstance();
  const weblinks = observable.array(defaultLinks);

  reaction(() => weblinkStore.weblinks, (links) => {
    weblinks.replace(links.map((data) => new WebLink({
      metadata: {
        uid: data.id,
        name: data.name,
        source: "local",
        labels: {}
      },
      spec: {
        url: data.url
      },
      status: {
        phase: "available",
        active: true
      }
    })));
    weblinks.push(...defaultLinks);

    for (const link of weblinks) {
      validateLink(link).catch((error) => {
        logger.error(`failed to validate link ${link.spec.url}: %s`, error);
      });
    }
  }, {fireImmediately: true});

  catalogEntityRegistry.addObservableSource("weblinks", weblinks);
}
