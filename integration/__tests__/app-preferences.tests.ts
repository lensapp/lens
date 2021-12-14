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

/*
  Cluster tests are run if there is a pre-existing minikube cluster. Before running cluster tests the TEST_NAMESPACE
  namespace is removed, if it exists, from the minikube cluster. Resources are created as part of the cluster tests in the
  TEST_NAMESPACE namespace. This is done to minimize destructive impact of the cluster tests on an existing minikube
  cluster and vice versa.
*/
import type { ElectronApplication, Page } from "playwright";
import * as utils from "../helpers/utils";

describe("preferences page tests", () => {
  let window: Page, cleanup: () => Promise<void>;

  beforeEach(async () => {
    let app: ElectronApplication;

    ({ window, cleanup, app } = await utils.start());
    await utils.clickWelcomeButton(window);

    await app.evaluate(async ({ app }) => {
      await app.applicationMenu
        .getMenuItemById(process.platform === "darwin" ? "root" : "file")
        .submenu.getMenuItemById("preferences")
        .click();
    });
  }, 10*60*1000);

  afterEach(async () => {
    await cleanup();
  }, 10*60*1000);

  it('shows "preferences" and can navigate through the tabs', async () => {
    const pages = [
      {
        id: "application",
        header: "Application",
      },
      {
        id: "proxy",
        header: "Proxy",
      },
      {
        id: "kubernetes",
        header: "Kubernetes",
      },
    ];

    for (const { id, header } of pages) {
      await window.click(`[data-testid=${id}-tab]`);
      await window.waitForSelector(`[data-testid=${id}-header] >> text=${header}`);
    }
  }, 10*60*1000);

  // Skipping, but will turn it on again in the follow up PR
  it.skip("ensures helm repos", async () => {
    await window.click("[data-testid=kubernetes-tab]");
    await window.waitForSelector("[data-testid=repository-name]", {
      timeout: 140_000,
    });
    await window.click("#HelmRepoSelect");
    await window.waitForSelector("div.Select__option");
  }, 10*60*1000);
});
