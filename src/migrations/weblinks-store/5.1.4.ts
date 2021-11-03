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

import { docsUrl, slackUrl } from "../../common/vars";
import type { WeblinkData } from "../../common/weblink-store";
import type { MigrationDeclaration } from "../helpers";

export default {
  version: "5.1.4",
  run(store) {
    const weblinksRaw: any = store.get("weblinks");
    const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];

    weblinks.push(
      { id: "https://k8slens.dev", name: "Lens Website", url: "https://k8slens.dev" },
      { id: docsUrl, name: "Lens Documentation", url: docsUrl },
      { id: slackUrl, name: "Lens Community Slack", url: slackUrl },
      { id: "https://kubernetes.io/docs/home/", name: "Kubernetes Documentation", url: "https://kubernetes.io/docs/home/" },
      { id: "https://twitter.com/k8slens", name: "Lens on Twitter", url: "https://twitter.com/k8slens" },
      { id: "https://medium.com/k8slens", name: "Lens Official Blog", url: "https://medium.com/k8slens" },
    );

    store.set("weblinks", weblinks);
  },
} as MigrationDeclaration;
