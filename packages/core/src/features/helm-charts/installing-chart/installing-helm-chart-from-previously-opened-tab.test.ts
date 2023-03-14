/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import getRandomInstallChartTabIdInjectable from "../../../renderer/components/dock/install-chart/get-random-install-chart-tab-id.injectable";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { TabKind } from "../../../renderer/components/dock/dock/store";
import requestCreateHelmReleaseInjectable from "../../../common/k8s-api/endpoints/helm-releases.api/request-create.injectable";
import type { RequestHelmChartVersions } from "../../../common/k8s-api/endpoints/helm-charts.api/request-versions.injectable";
import requestHelmChartVersionsInjectable from "../../../common/k8s-api/endpoints/helm-charts.api/request-versions.injectable";
import type { RequestHelmChartValues } from "../../../common/k8s-api/endpoints/helm-charts.api/request-values.injectable";
import requestHelmChartValuesInjectable from "../../../common/k8s-api/endpoints/helm-charts.api/request-values.injectable";

describe("installing helm chart from previously opened tab", () => {
  let builder: ApplicationBuilder;
  let requestHelmChartVersionsMock: AsyncFnMock<RequestHelmChartVersions>;
  let requestHelmChartValuesMock: AsyncFnMock<RequestHelmChartValues>;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    requestHelmChartVersionsMock = asyncFn();
    requestHelmChartValuesMock = asyncFn();

    builder.namespaces.add("default");
    builder.namespaces.add("some-other-namespace");

    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.override(directoryForLensLocalStorageInjectable, () => "/some-directory-for-lens-local-storage");
      windowDi.override(requestHelmChartVersionsInjectable, () => requestHelmChartVersionsMock);
      windowDi.override(requestHelmChartValuesInjectable, () => requestHelmChartValuesMock);
      windowDi.override(requestCreateHelmReleaseInjectable, () => jest.fn());

      windowDi.override(getRandomInstallChartTabIdInjectable, () =>
        jest
          .fn(() => "some-irrelevant-tab-id")
          .mockReturnValueOnce("some-first-tab-id"),
      );
    });
  });

  describe("given tab for installing chart was previously opened, when application is started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      builder.beforeWindowStart(async ({ windowDi }) => {
        const writeJsonFile = windowDi.inject(writeJsonFileInjectable);

        await writeJsonFile(
          "/some-directory-for-lens-local-storage/some-cluster-id.json",
          {
            dock: {
              height: 300,
              tabs: [
                {
                  id: "some-first-tab-id",
                  kind: TabKind.INSTALL_CHART,
                  title: "Helm Install: some-repository/some-name",
                  pinned: false,
                },
              ],

              isOpen: true,
            },

            install_charts: {
              "some-first-tab-id": {
                name: "some-name",
                repo: "some-repository",
                version: "some-other-version",
                values: "some-stored-configuration",
                releaseName: "some-stored-custom-name",
                namespace: "some-other-namespace",
              },
            },
          },
        );
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("still has the dock tab for installing chart", () => {
      expect(
        rendered.getByTestId("dock-tab-for-some-first-tab-id"),
      ).toBeInTheDocument();
    });

    it("shows dock tab for installing the chart", () => {
      expect(
        rendered.getByTestId("dock-tab-content-for-some-first-tab-id"),
      ).toBeInTheDocument();
    });

    it("shows spinner in dock tab", () => {
      expect(
        rendered.getByTestId("install-chart-tab-spinner"),
      ).toBeInTheDocument();
    });

    it("calls for default configuration of the chart", () => {
      expect(requestHelmChartValuesMock).toHaveBeenCalledWith(
        "some-repository",
        "some-name",
        "some-other-version",
      );
    });

    it("calls for available versions", () => {
      expect(requestHelmChartVersionsMock).toHaveBeenCalledWith(
        "some-repository",
        "some-name",
      );
    });

    describe("when configuration and version resolves", () => {
      beforeEach(async () => {
        await requestHelmChartValuesMock.resolve({
          callWasSuccessful: true,
          response: "some-default-configuration",
        });

        await requestHelmChartVersionsMock.resolve([
          HelmChart.create({
            apiVersion: "some-api-version",
            name: "some-name",
            version: "some-version",
            repo: "some-repository",
            created: "2015-10-21T07:28:00Z",
            description: "some-description",
            keywords: [],
            sources: [],
            urls: [],
            annotations: {},
            dependencies: [],
            maintainers: [],
            deprecated: false,
          }),

          HelmChart.create({
            apiVersion: "some-api-version",
            name: "some-name",
            version: "some-other-version",
            repo: "some-repository",
            created: "2015-10-21T07:28:00Z",
            description: "some-description",
            keywords: [],
            sources: [],
            urls: [],
            annotations: {},
            dependencies: [],
            maintainers: [],
            deprecated: false,
          }),
        ]);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("has the stored configuration", () => {
        const input = rendered.getByTestId(
          "monaco-editor-for-some-first-tab-id",
        );

        expect(input).toHaveValue("some-stored-configuration");
      });

      it("has the stored custom name", () => {
        const input = rendered.getByTestId(
          "install-chart-custom-name-input-for-some-first-tab-id",
        );

        expect(input).toHaveValue("some-stored-custom-name");
      });

      it("has the stored version", () => {
        const actual = builder.select.getValue(
          "install-chart-version-select-for-some-first-tab-id",
        );

        expect(actual).toBe("some-other-version");

      });

      it("has the stored namespace", () => {
        const actual = builder.select.getValue(
          "install-chart-namespace-select-for-some-first-tab-id",
        );

        expect(actual).toBe("some-other-namespace");
      });
    });
  });
});
