/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
  let window: Page;
  let cleanup: undefined | (() => Promise<void>);

  beforeEach(async () => {
    let app: ElectronApplication;

    ({ window, cleanup, app } = await utils.start());
    await utils.clickWelcomeButton(window);

    await app.evaluate(async ({ app }) => {
      await app.applicationMenu
        ?.getMenuItemById(process.platform === "darwin" ? "mac" : "file")
        ?.submenu
        ?.getMenuItemById("navigate-to-preferences")
        ?.click();
    });
  }, 10*60*1000);

  afterEach(async () => {
    await cleanup?.();
  }, 10*60*1000);

  it('shows "preferences" and can navigate through the tabs', async () => {
    const pages = [
      {
        id: "app",
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
      await window.click(`[data-preference-tab-link-test=${id}]`);
      await window.waitForSelector(`[data-preference-page-title-test] >> text=${header}`);
    }
  }, 10*60*1000);

  // Skipping, but will turn it on again in the follow up PR
  it.skip("ensures helm repos", async () => {
    await window.click("[data-testid=kubernetes-tab]");
    await window.waitForSelector("[data-testid=repository-name]");
    await window.click("#HelmRepoSelect");
    await window.waitForSelector("div.Select__option");
  }, 10*60*1000);
});
