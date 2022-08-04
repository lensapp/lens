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
import type { CallForHelmChartValues } from "../../../renderer/components/dock/install-chart/chart-data/call-for-helm-chart-values.injectable";
import callForHelmChartValuesInjectable from "../../../renderer/components/dock/install-chart/chart-data/call-for-helm-chart-values.injectable";
import namespaceStoreInjectable from "../../../renderer/components/+namespaces/store.injectable";
import type { NamespaceStore } from "../../../renderer/components/+namespaces/store";
import type { CallForHelmChartVersions } from "../../../renderer/components/+helm-charts/details/versions/call-for-helm-chart-versions.injectable";
import callForHelmChartVersionsInjectable from "../../../renderer/components/+helm-charts/details/versions/call-for-helm-chart-versions.injectable";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import hostedClusterIdInjectable from "../../../renderer/cluster-frame-context/hosted-cluster-id.injectable";
import { TabKind } from "../../../renderer/components/dock/dock/store";
import { controlWhenStoragesAreReady } from "../../../renderer/utils/create-storage/storages-are-ready";
import callForCreateHelmReleaseInjectable from "../../../renderer/components/+helm-releases/create-release/call-for-create-helm-release.injectable";

describe("installing helm chart from previously opened tab", () => {
  let builder: ApplicationBuilder;
  let callForHelmChartVersionsMock: AsyncFnMock<CallForHelmChartVersions>;
  let callForHelmChartValuesMock: AsyncFnMock<CallForHelmChartValues>;
  let storagesAreReady: () => Promise<void>;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    callForHelmChartVersionsMock = asyncFn();
    callForHelmChartValuesMock = asyncFn();

    builder.beforeWindowStart((windowDi) => {
      windowDi.override(
        directoryForLensLocalStorageInjectable,
        () => "/some-directory-for-lens-local-storage",
      );

      windowDi.override(hostedClusterIdInjectable, () => "some-cluster-id");

      storagesAreReady = controlWhenStoragesAreReady(windowDi);

      windowDi.override(
        callForHelmChartVersionsInjectable,
        () => callForHelmChartVersionsMock,
      );

      windowDi.override(
        callForHelmChartValuesInjectable,
        () => callForHelmChartValuesMock,
      );

      windowDi.override(
        callForHelmChartValuesInjectable,
        () => callForHelmChartValuesMock,
      );

      windowDi.override(
        callForCreateHelmReleaseInjectable,
        () => jest.fn(),
      );

      // TODO: Replace store mocking with mock for the actual side-effect (where the namespaces are coming from)
      windowDi.override(
        namespaceStoreInjectable,
        () =>
          ({
            contextNamespaces: [],
            items: [
              { getName: () => "default" },
              { getName: () => "some-other-namespace" },
            ],
            selectNamespaces: () => {},
          } as unknown as NamespaceStore),
      );

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
      builder.beforeWindowStart(async (windowDi) => {
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

      await storagesAreReady();
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
      expect(callForHelmChartValuesMock).toHaveBeenCalledWith(
        "some-repository",
        "some-name",
        "some-other-version",
      );
    });

    it("calls for available versions", () => {
      expect(callForHelmChartVersionsMock).toHaveBeenCalledWith(
        "some-repository",
        "some-name",
      );
    });

    describe("when configuration and version resolves", () => {
      beforeEach(async () => {
        await callForHelmChartValuesMock.resolve(
          "some-default-configuration",
        );

        await callForHelmChartVersionsMock.resolve([
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
