/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import type { CallForHelmCharts } from "../../../renderer/components/+helm-charts/helm-charts/call-for-helm-charts.injectable";
import callForHelmChartsInjectable from "../../../renderer/components/+helm-charts/helm-charts/call-for-helm-charts.injectable";
import { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import getRandomInstallChartTabIdInjectable from "../../../renderer/components/dock/install-chart/get-random-install-chart-tab-id.injectable";
import callForHelmChartValuesInjectable from "../../../renderer/components/dock/install-chart/chart-data/call-for-helm-chart-values.injectable";
import callForCreateHelmReleaseInjectable from "../../../renderer/components/+helm-releases/create-release/call-for-create-helm-release.injectable";
import type { CallForHelmChartReadme } from "../../../renderer/components/+helm-charts/details/readme/call-for-helm-chart-readme.injectable";
import callForHelmChartReadmeInjectable from "../../../renderer/components/+helm-charts/details/readme/call-for-helm-chart-readme.injectable";
import type { CallForHelmChartVersions } from "../../../renderer/components/+helm-charts/details/versions/call-for-helm-chart-versions.injectable";
import callForHelmChartVersionsInjectable from "../../../renderer/components/+helm-charts/details/versions/call-for-helm-chart-versions.injectable";
import { flushPromises } from "../../../common/test-utils/flush-promises";
import { overrideFsWithFakes } from "../../../test-utils/override-fs-with-fakes";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import hostedClusterIdInjectable from "../../../renderer/cluster-frame-context/hosted-cluster-id.injectable";
import dockStoreInjectable from "../../../renderer/components/dock/dock/store.injectable";
import type { DiContainer } from "@ogre-tools/injectable";

// TODO: Make tooltips free of side effects by making it deterministic
jest.mock("../../../renderer/components/tooltip/withTooltip", () => ({
  withTooltip: (target: any) => target,
}));

describe("opening dock tab for installing helm chart", () => {
  let builder: ApplicationBuilder;
  let rendererDi: DiContainer;
  let callForHelmChartsMock: AsyncFnMock<CallForHelmCharts>;
  let callForHelmChartVersionsMock: AsyncFnMock<CallForHelmChartVersions>;
  let callForHelmChartReadmeMock: AsyncFnMock<CallForHelmChartReadme>;
  let callForHelmChartValuesMock: jest.Mock;

  beforeEach(() => {
    builder = getApplicationBuilder();

    rendererDi = builder.dis.rendererDi;

    overrideFsWithFakes(rendererDi);

    callForHelmChartsMock = asyncFn();
    callForHelmChartVersionsMock = asyncFn();
    callForHelmChartReadmeMock = asyncFn();
    callForHelmChartValuesMock = jest.fn();

    builder.beforeApplicationStart(({ rendererDi }) => {
      rendererDi.override(
        directoryForLensLocalStorageInjectable,
        () => "/some-directory-for-lens-local-storage",
      );

      rendererDi.override(hostedClusterIdInjectable, () => "some-cluster-id");

      rendererDi.override(
        callForHelmChartsInjectable,
        () => callForHelmChartsMock,
      );

      rendererDi.override(
        callForHelmChartVersionsInjectable,
        () => callForHelmChartVersionsMock,
      );

      rendererDi.override(
        callForHelmChartReadmeInjectable,
        () => callForHelmChartReadmeMock,
      );

      rendererDi.override(
        callForHelmChartValuesInjectable,
        () => callForHelmChartValuesMock,
      );

      rendererDi.override(
        callForCreateHelmReleaseInjectable,
        () => jest.fn(),
      );

      rendererDi.override(getRandomInstallChartTabIdInjectable, () =>
        jest
          .fn(() => "some-irrelevant-tab-id")
          .mockReturnValueOnce("some-tab-id"),
      );
    });

    builder.setEnvironmentToClusterFrame();
  });

  describe("given application is started, when navigating to helm charts", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await builder.render();

      builder.helmCharts.navigate();

      const dockStore = rendererDi.inject(dockStoreInjectable);

      // TODO: Make TerminalWindow unit testable to allow realistic behaviour
      dockStore.closeTab("terminal");
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("calls for charts", () => {
      expect(callForHelmChartsMock).toHaveBeenCalled();
    });

    describe("when charts resolve", () => {
      beforeEach(async () => {
        await callForHelmChartsMock.resolve([
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
            name: "some-other-name",
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
        ]);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when opening details of a chart", () => {
        beforeEach(() => {
          const row = rendered.getByTestId(
            "helm-chart-row-for-some-repository-some-name",
          );

          fireEvent.click(row);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("calls for chart versions", () => {
          expect(callForHelmChartVersionsMock).toHaveBeenCalledWith(
            "some-repository",
            "some-name",
          );
        });

        it("shows spinner", () => {
          expect(
            rendered.getByTestId("spinner-for-chart-details"),
          ).toBeInTheDocument();
        });

        describe("when chart versions resolve", () => {
          beforeEach(async () => {
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

          it("calls for chart readme for the version", () => {
            expect(callForHelmChartReadmeMock).toHaveBeenCalledWith(
              "some-repository",
              "some-name",
              "some-version",
            );
          });

          it("has the latest version as selected", () => {
            const actual = builder.select.getValue(
              "helm-chart-version-selector-some-repository-some-name",
            );

            expect(actual).toBe("some-version");
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("does not shows spinner for details", () => {
            expect(
              rendered.queryByTestId("spinner-for-chart-details"),
            ).not.toBeInTheDocument();
          });

          it("shows spinner for readme", () => {
            expect(
              rendered.getByTestId("spinner-for-chart-readme"),
            ).toBeInTheDocument();
          });

          describe("when readme resolves", () => {
            beforeEach(async () => {
              await callForHelmChartReadmeMock.resolve("some-readme");
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("does not show spinner anymore", () => {
              expect(
                rendered.queryByTestId("spinner-for-chart-readme"),
              ).not.toBeInTheDocument();
            });

            describe("when selecting different version", () => {
              beforeEach(() => {
                callForHelmChartReadmeMock.mockClear();

                builder.select
                  .openMenu(
                    "helm-chart-version-selector-some-repository-some-name",
                  )
                  .selectOption("some-other-version");
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("selects the version", () => {
                const actual = builder.select.getValue(
                  "helm-chart-version-selector-some-repository-some-name",
                );

                expect(actual).toBe("some-other-version");
              });

              it("calls for chart readme for the version", () => {
                expect(callForHelmChartReadmeMock).toHaveBeenCalledWith(
                  "some-repository",
                  "some-name",
                  "some-other-version",
                );
              });

              describe("when readme resolves", () => {
                beforeEach(async () => {
                  await callForHelmChartReadmeMock.resolve("some-readme");
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("when selecting to install chart, calls for the default configuration of the chart with specific version", async () => {
                  const installButton = rendered.getByTestId(
                    "install-chart-for-some-repository-some-name",
                  );

                  fireEvent.click(installButton);

                  await flushPromises();

                  expect(callForHelmChartValuesMock).toHaveBeenCalledWith(
                    "some-repository",
                    "some-name",
                    "some-other-version",
                  );
                });
              });
            });

            describe("when selecting to install the chart", () => {
              beforeEach(() => {
                callForHelmChartVersionsMock.mockClear();

                const installButton = rendered.getByTestId(
                  "install-chart-for-some-repository-some-name",
                );

                fireEvent.click(installButton);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("has the dock tab for installing chart", () => {
                expect(
                  rendered.getByTestId("dock-tab-for-some-tab-id"),
                ).toBeInTheDocument();
              });

              it("shows dock tab for installing chart", () => {
                expect(
                  rendered.getByTestId(
                    "dock-tab-content-for-some-tab-id",
                  ),
                ).toBeInTheDocument();
              });
            });
          });
        });
      });
    });
  });
});
