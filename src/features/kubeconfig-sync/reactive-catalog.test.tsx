/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import navigateToCatalogInjectable from "../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import writeFileInjectable from "../../common/fs/write-file.injectable";
import { dumpConfigYaml } from "../../common/kube-helpers";
import homeDirectoryPathInjectable from "../../common/os/home-directory-path.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import { flushPromises } from "../../common/test-utils/flush-promises";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("kubeconfig sync showing reactive catalog", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let windowDi: DiContainer;
  let mainDi: DiContainer;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    // builder.mainDi.override(loggerInjectable, () => console as any);
    rendered = await builder.render();
    windowDi = builder.applicationWindow.only.di;
    mainDi = builder.mainDi;
  });

  it("renders", () => {
    expect(rendered.baseElement).toMatchSnapshot();
  });

  describe("when navigating to the catalog", () => {
    beforeEach(() => {
      const navigateToCatalog = windowDi.inject(navigateToCatalogInjectable);

      navigateToCatalog();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    describe("when a config file is written under ~/.kube", () => {
      beforeEach(async () => {
        const writeFile = mainDi.inject(writeFileInjectable);
        const joinPaths = mainDi.inject(joinPathsInjectable);
        const homeDirectoryPath = mainDi.inject(homeDirectoryPathInjectable);

        const configContents = dumpConfigYaml({
          clusters: [{
            name: "some-cluster-name",
            server: "https://1.2.3.4",
            skipTLSVerify: false,
          }],
          users: [{
            name: "some-user-name",
          }],
          contexts: [{
            cluster: "some-cluster-name",
            name: "some-context-name",
            user: "some-user-name",
          }],
        });

        await writeFile(joinPaths(homeDirectoryPath, ".kube", "config"), configContents);
        await flushPromises();
      });

      it.only("eventually shows the cluster as a new entity", async () => {
        await rendered.findByTestId("catalog-entity-row-for-some-cluster-name", undefined, {
          timeout: 10_000,
        });
      }, 100_000);
    });
  });
});
